<template>
  <div>
    <div class="anchor-wrapper">
      <n-anchor v-model:value="activeAnchor" :show-rail="true" :show-background="true">
        <n-anchor-link v-for="action in rotation" :key="action.id" :title="action.name" :href="`#${action.name}`" />
      </n-anchor>
    </div>

    <div class="calculator-container">
      <div class="page-header">
        <h1 class="gradient-title">Endfield伤害期望计算器</h1>
        <p class="subtitle">计算每一击的伤害期望</p>
      </div>

      <div class="timeline-tabs-wrapper">
        <n-tabs v-model:value="activeTimelineId" type="card" closable tab-style="font-weight: bold;"
          @close="calcStore.removeTimeline" @add="calcStore.addTimeline">
          <n-tab-pane v-for="tl in timelines" :key="tl.id" :name="tl.id" :tab="tl.name"></n-tab-pane>

          <template #suffix>
            <n-button @click="calcStore.copyTimeline(activeTimelineId)" size="small" type="primary" dashed round>
              复制当前轴
            </n-button>
          </template>
        </n-tabs>
      </div>

      <div class="panel-section glass-panel">
        <div class="panel-header">
          <h2>当前轴配置</h2>
          <n-input v-model:value="activeTimeline.name" placeholder="为这条轴起个名字..." style="max-width: 250px;" size="small"
            round />
        </div>

        <n-divider style="margin: 12px 0;" />

        <n-grid :x-gap="20" :y-gap="15" cols="2 m:4" responsive="screen">

          <n-grid-item>
            <label class="form-label">干员</label>
            <select v-model="activeTimeline.selectedOperator" class="premium-select">
              <option v-for="op in operators" :key="op.name" :value="op">{{ op.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">武器</label>
            <select v-model="activeTimeline.selectedWeapon" class="premium-select">
              <option v-for="w in weapons" :key="w.name" :value="w">{{ w.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">套装</label>
            <select v-model="activeTimeline.selectedSet" class="premium-select">
              <option v-for="s in sets" :key="s.name" :value="s">{{ s.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">食物</label>
            <select v-model="activeTimeline.selectedFood" class="premium-select">
              <option v-for="f in foods" :key="f.name" :value="f">{{ f.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">护甲</label>
            <select v-model="activeTimeline.selectedArmor" class="premium-select">
              <option v-for="a in armors" :key="a.name" :value="a">{{ a.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">护手</label>
            <select v-model="activeTimeline.selectedGlove" class="premium-select">
              <option v-for="a in gloves" :key="a.name" :value="a">{{ a.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">配件1</label>
            <select v-model="activeTimeline.selectedAccessory1" class="premium-select">
              <option v-for="a in accessories" :key="a.name" :value="a">{{ a.name }}</option>
            </select>
          </n-grid-item>

          <n-grid-item>
            <label class="form-label">配件2</label>
            <select v-model="activeTimeline.selectedAccessory2" class="premium-select">
              <option v-for="a in accessories" :key="a.name" :value="a">{{ a.name }}</option>
            </select>
          </n-grid-item>
        </n-grid>

        <div class="static-stats-bar">
          <div class="stat-chip"><span class="label">基础攻击</span><span class="val">{{ stepA_BaseAttack }}</span></div>
          <div class="stat-chip"><span class="label">力量</span><span class="val">{{ totalStrength }}</span></div>
          <div class="stat-chip"><span class="label">敏捷</span><span class="val">{{ totalAgility }}</span></div>
          <div class="stat-chip"><span class="label">智识</span><span class="val">{{ totalIntelligence }}</span></div>
          <div class="stat-chip"><span class="label">意志</span><span class="val">{{ totalWillpower }}</span></div>
        </div>
      </div>

      <div class="panel-section">
        <div class="timeline-header-main">
          <h2>动作序列 ({{ rotation.length }} 步)</h2>
          <n-button strong secondary round type="info" @click="calcStore.addAction">
            插入新动作
          </n-button>
        </div>

        <transition-group name="list" tag="div" class="action-list-wrapper">
          <n-card v-for="(action, index) in rotation" :key="action.id" :id="action.name" class="action-card"
            :class="{ 'is-active-anchor': activeAnchor === '#' + action.name }" hoverable>
            <div class="action-card-top">
              <n-flex align="center" :wrap="false" class="action-controls">
                <div class="action-step-badge">{{ index + 1 }}</div>

                <n-input v-model:value="action.name" placeholder="动作名称" style="width: 140px;" />

                <n-input-number v-model:value="action.hits" :min="0" style="width: 110px;">
                  <template #suffix>Hit</template>
                </n-input-number>

                <select v-model="action.skill" class="premium-select skill-select">
                  <option v-for="s in skills" :key="s.name" :value="s">{{ s.name }}</option>
                </select>

                <div class="action-actions">
                  <n-button @click="calcStore.copyAction(index)" secondary type="info" size="small" circle title="复制">
                    C
                  </n-button>
                  <n-button @click="calcStore.removeAction(index)" secondary type="error" size="small" circle
                    title="删除">
                    X
                  </n-button>
                </div>
              </n-flex>
            </div>

            <div class="buff-section">
              <div class="buff-section-header" @click="calcStore.toggleBuffList(action.id)">
                <div class="buff-header-left">
                  <span class="buff-title">临时增益 ✨</span>
                  <div class="selected-buffs-summary" v-if="!actionBuffListExpanded[action.id]">
                    <span v-if="action.activeBuffs.length === 0" class="placeholder-text">未选择 Buff</span>
                    <span v-else v-for="b in action.activeBuffs" :key="b.name" class="summary-buff-tag">
                      {{ b.name }}
                    </span>
                  </div>
                </div>
                <span class="toggle-text">{{ actionBuffListExpanded[action.id] ? '收起 ▲' : '展开选择 ▼' }}</span>
              </div>

              <n-collapse-transition :show="actionBuffListExpanded[action.id]">
                <div class="buff-full-list">
                  <div class="buff-tags-container">
                    <label v-for="buff in availableBuffs" :key="buff.name" class="buff-tag-item"
                      :class="{ 'is-active': action.activeBuffs.some(b => b.name === buff.name) }">
                      <input type="checkbox" :value="buff" v-model="action.activeBuffs" class="hidden-checkbox" />
                      {{ buff.name }}
                    </label>
                  </div>
                </div>
              </n-collapse-transition>
            </div>

            <div class="action-result-dashboard">
              <div class="result-mini-stats">
                <span>面板攻击: <strong>{{ Math.floor(rotationResults[index]?.finalAttack || 0) }}</strong></span>
                <n-divider vertical />
                <span>暴击率: <strong>{{ ((rotationResults[index]?.currentCritRate || 0) * 100).toFixed(1)
                    }}%</strong></span>
                <n-divider vertical />
                <span>暴击伤害: <strong>{{ ((rotationResults[index]?.currentCritDamage || 0) * 100).toFixed(1)
                    }}%</strong></span>
              </div>

              <div class="result-highlight-box">
                <div class="dmg-block">
                  <div class="dmg-label">期望伤害</div>
                  <div class="dmg-value highlight-amber">{{ Math.floor(rotationResults[index]?.finalExpectedDamage || 0)
                  }}
                  </div>
                </div>
                <div class="dmg-block">
                  <div class="dmg-label">全暴击伤害</div>
                  <div class="dmg-value highlight-red">{{ Math.floor(rotationResults[index]?.finalCritDamage || 0) }}
                  </div>
                </div>
              </div>
            </div>
          </n-card>
        </transition-group>
      </div>
    </div>

    <div class="sticky-bottom-summary">
      <div class="summary-content">
        <div class="summary-text">
          <h3>当前轴总览</h3>
          <p>包含 {{ rotation.length }} 个输出动作</p>
        </div>
        <div class="summary-data">
          <div class="data-item">
            <span class="data-label">总期望伤害</span>
            <span class="data-value text-gradient-gold">{{ Math.floor(totalRotationDamage) }}</span>
          </div>
          <n-divider vertical style="height: 40px; margin: 0 20px; background-color: rgba(0,0,0,0.1);" />
          <div class="data-item">
            <span class="data-label">全暴击上限</span>
            <span class="data-value text-gradient-red">{{ Math.floor(totalCritDamage) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NInputNumber, NInput, NCard, NButton, NFlex, NAnchor, NAnchorLink,
  NTabs, NTabPane, NDivider, NCollapseTransition, NGrid, NGridItem
} from 'naive-ui'

import { useGameDataStore } from '../stores/useGameDataStore'
import { useCalculatorStore } from '../stores/useCalculatorStore'
import { useDamageCalculator } from '../composables/useDamageCalculator'

const dataStore = useGameDataStore()
const calcStore = useCalculatorStore()

const { operators, weapons, armors, gloves, accessories, sets, availableBuffs, skills, foods } = storeToRefs(dataStore)

const {
  activeTimeline,
  activeTimelineId,
  timelines,
  rotation,
  actionBuffListExpanded,
  selectedOperator,
  selectedWeapon,
  selectedArmor,
  selectedGlove,
  selectedAccessory1,
  selectedAccessory2,
  selectedSet,
  selectedFood,
} = storeToRefs(calcStore)

onMounted(() => {
  if (rotation.value.length === 0) {
    calcStore.addAction()
  }
})

const {
  totalStrength, totalAgility, totalIntelligence, totalWillpower, stepA_BaseAttack,
  rotationResults, totalRotationDamage, totalCritDamage
} = useDamageCalculator({
  operator: selectedOperator,
  weapon: selectedWeapon,
  armor: selectedArmor,
  glove: selectedGlove,
  accessory1: selectedAccessory1,
  accessory2: selectedAccessory2,
  set: selectedSet,
  rotation: rotation,
  food: selectedFood,
})

const activeAnchor = ref('')
</script>

<style scoped>
/* 侧边导航栏悬浮 */
.anchor-wrapper {
  position: fixed;
  top: 120px;
  left: calc(50% - 660px);
  width: 120px;
  z-index: 99;
}

/* 屏幕太小时（没有左侧空白）自动隐藏导航，防止遮挡 */
@media (max-width: 1380px) {
  .anchor-wrapper {
    display: none;
  }
}

.calculator-container {
  max-width: 1080px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  color: #2c3e50;
  padding: 20px 20px 120px 20px;
}

.page-header {
  margin-bottom: 25px;
  text-align: center;
}

.gradient-title {
  font-size: 2.2rem;
  margin: 0 0 5px 0;
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}


.panel-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  border: 1px solid #f1f5f9;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.premium-select {
  appearance: none;
  width: 100%;
  padding: 8px 32px 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  font-size: 0.9rem;
  color: #334155;
  font-family: inherit;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.premium-select:not(:disabled):hover {
  border-color: #94a3b8;
}

.premium-select:not(:disabled):focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background-color: #ffffff;
}


.static-stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.stat-chip .label {
  color: #64748b;
}

.stat-chip .val {
  font-weight: bold;
  color: #0f172a;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 12px;
}


.timeline-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.timeline-header-main h2 {
  margin: 0;
  font-size: 1.25rem;
}


.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.action-card {
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  scroll-margin-top: 100px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.is-active-anchor {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.action-card-top {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.action-step-badge {
  background: #1e293b;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
}

.skill-select {
  flex: 1;
  max-width: 250px;
}

.action-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.buff-section {
  padding: 0;
}

.buff-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background-color: #ffffff;
  transition: background 0.2s;
}

.buff-section-header:hover {
  background-color: #f8fafc;
}

.buff-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buff-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
}

.toggle-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.selected-buffs-summary {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.summary-buff-tag {
  font-size: 0.75rem;
  background-color: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.placeholder-text {
  font-size: 0.8rem;
  color: #cbd5e1;
  font-style: italic;
}

.buff-full-list {
  padding: 0 16px 16px 16px;
}

.buff-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.hidden-checkbox {
  display: none;
}

.buff-tag-item {
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: 20px;
  background-color: #f1f5f9;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  border: 1px solid transparent;
}

.buff-tag-item:hover {
  background-color: #e2e8f0;
}

.buff-tag-item.is-active {
  background-color: #ecfdf5;
  color: #059669;
  border-color: #34d399;
  font-weight: 600;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.action-result-dashboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
}

.result-mini-stats {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
}

.result-mini-stats strong {
  color: #1e293b;
}

.result-highlight-box {
  display: flex;
  gap: 20px;
}

.dmg-block {
  text-align: right;
}

.dmg-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dmg-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
}

.highlight-amber {
  color: #d97706;
}

.highlight-red {
  color: #e11d48;
}

/* 悬浮统计栏 */
.sticky-bottom-summary {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 1040px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  padding: 16px 30px;
  z-index: 100;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-text h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.summary-text p {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

.summary-data {
  display: flex;
  align-items: center;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.data-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.data-value {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1.2;
}

.text-gradient-gold {
  background: linear-gradient(to right, #d97706, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-red {
  background: linear-gradient(to right, #e11d48, #be123c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>