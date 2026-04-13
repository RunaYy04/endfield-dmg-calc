<template>
  <div class="add-view-container">
    <div class="page-header">
      <h1 class="gradient-title">添加角色</h1>
      <p class="subtitle">在这里添加的自定义角色，将直接同步到计算器的干员下拉列表中。</p>
    </div>

    <div class="panel-section glass-panel">
      <n-grid :x-gap="24" :y-gap="20" cols="1 s:3" responsive="screen">
        <n-grid-item>
          <label class="form-label">角色名称 <span class="required">*</span></label>
          <n-input v-model:value="formData.name" placeholder="例如：自定义管理员" size="large" clearable />
        </n-grid-item>
        <n-grid-item>
          <label class="form-label">主属性</label>
          <n-select v-model:value="formData.mainAttributeTag" :options="attributeOptions" size="large" />
        </n-grid-item>
        <n-grid-item>
          <label class="form-label">副属性</label>
          <n-select v-model:value="formData.subAttributeTag" :options="attributeOptions" size="large" />
        </n-grid-item>
      </n-grid>

      <n-divider dashed>
        <span class="divider-text">基础面板</span>
      </n-divider>

      <n-grid :x-gap="24" :y-gap="20" cols="2 s:3 m:4" responsive="screen">
        <n-grid-item v-for="field in baseFields" :key="field.key">
          <label class="form-label">{{ field.label }}</label>
          <n-input-number v-model:value="formData[field.key]" :step="field.isPercent ? 0.01 : (field.step || 1)"
            :format="field.isPercent ? formatPercent : undefined" :parse="field.isPercent ? parsePercent : undefined"
            clearable placeholder="0">
            <template #suffix v-if="field.isPercent">%</template>
          </n-input-number>
        </n-grid-item>
      </n-grid>

      <n-divider dashed>
        <span class="divider-text">伤害与乘区</span>
      </n-divider>

      <n-grid :x-gap="24" :y-gap="20" cols="2 s:3 m:4" responsive="screen">
        <n-grid-item v-for="field in advancedFields" :key="field.key">
          <label class="form-label">{{ field.label }}</label>
          <n-input-number v-model:value="formData[field.key]" :step="field.isPercent ? 0.01 : (field.step || 1)"
            :format="field.isPercent ? formatPercent : undefined" :parse="field.isPercent ? parsePercent : undefined"
            clearable placeholder="0">
            <template #suffix v-if="field.isPercent">%</template>
          </n-input-number>
        </n-grid-item>
      </n-grid>

      <div class="action-row">
        <n-button size="large" ghost color="#6AA8C8" @click="submitOperator">
          保存角色并生效
        </n-button>
        <transition name="fade">
          <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>
        </transition>
      </div>

      <n-divider dashed>
        <span class="divider-text">当前角色</span>
      </n-divider>

      <div class="manage-section">
        <div class="manage-header">
          <span class="manage-count">共 {{ operators.length }} 个角色</span>
          <span class="manage-tip">删除后，计算器中正在使用的角色会自动切换到剩余选项。</span>
        </div>

        <div class="manage-list">
          <div v-for="operator in operators" :key="operator.name" class="manage-item">
            <div class="manage-item-main">
              <div class="manage-item-title">{{ operator.name }}</div>
              <div class="manage-item-meta">
                <span>主属性 {{ operator.mainAttributeTag || '无' }}</span>
                <span>副属性 {{ operator.subAttributeTag || '无' }}</span>
                <span>基础攻击 {{ operator.baseAttack }}</span>
              </div>
            </div>
            <n-button size="small" secondary type="error" :disabled="operators.length <= 1"
              @click="deleteOperator(operator.name)">
              删除
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NInput, NInputNumber, NSelect, NGrid, NGridItem, NDivider, NButton } from 'naive-ui'
import { useGameDataStore } from '../stores/useGameDataStore'
import { useCalculatorStore } from '../stores/useCalculatorStore'
import type { Operator } from '../types'

interface FieldConfig {
  label: string
  key: keyof Operator
  step?: number
  isPercent?: boolean
}

const gameData = useGameDataStore()
const calcStore = useCalculatorStore()
const { operators } = storeToRefs(gameData)
const successMessage = ref('')
let successTimer: ReturnType<typeof setTimeout> | null = null

const formatPercent = (value: number | null): string => {
  if (value === null || value === undefined) return ''
  return String(Number((value * 100).toFixed(2)))
}

const parsePercent = (input: string): number | null => {
  if (!input) return null
  const num = parseFloat(input)
  if (isNaN(num)) return null
  return Number((num / 100).toFixed(4))
}

const attributeOptions = [
  { label: '无', value: '' },
  { label: '力量', value: '力量' },
  { label: '敏捷', value: '敏捷' },
  { label: '智识', value: '智识' },
  { label: '意志', value: '意志' }
]

const baseFields: FieldConfig[] = [
  { label: '基础攻击力', key: 'baseAttack' },
  { label: '力量', key: 'strength' },
  { label: '敏捷', key: 'agility' },
  { label: '智识', key: 'intelligence' },
  { label: '意志', key: 'willpower' },
  { label: '暴击率', key: 'critRate', isPercent: true },
  { label: '暴击伤害', key: 'critDamage', isPercent: true },
  { label: '固定攻击力', key: 'flatAttack' },
  { label: '特殊系数', key: 'specialStatBonus', isPercent: true }
]

const advancedFields: FieldConfig[] = [
  { label: '攻击力加成', key: 'atkPercentBonus', isPercent: true },
  { label: '物理加成', key: 'physBonus', isPercent: true },
  { label: '灼热加成', key: 'thermalBonus', isPercent: true },
  { label: '电磁加成', key: 'electroBonus', isPercent: true },
  { label: '寒冷加成', key: 'cryoBonus', isPercent: true },
  { label: '自然加成', key: 'natureBonus', isPercent: true },
  { label: '普攻加成', key: 'normalAtkBonus', isPercent: true },
  { label: '战技加成', key: 'skillBonus', isPercent: true },
  { label: '连携技加成', key: 'comboBonus', isPercent: true },
  { label: '终结技加成', key: 'ultimateBonus', isPercent: true },
  { label: '失衡伤害加成', key: 'staggerBonus', isPercent: true },
  { label: '源石技艺强度', key: 'originiumArtBonus', isPercent: true },
  { label: '伤害加成', key: 'dmgBonus', isPercent: true },
  { label: '增幅加成', key: 'amplification', isPercent: true },
  { label: '易伤加成', key: 'vulnerability', isPercent: true },
  { label: '脆弱加成', key: 'fragility', isPercent: true },
  { label: '失衡易伤', key: 'staggerVuln', isPercent: true },
  { label: '连击加成', key: 'comboMultiplier', isPercent: true },
  { label: '特殊乘区', key: 'specialMultiplier', isPercent: true },
  { label: '减抗加成', key: 'resistancePen', isPercent: true }
]

const initialFormState: Operator = {
  name: '',
  baseAttack: 0,
  strength: 0,
  agility: 0,
  intelligence: 0,
  willpower: 0,
  critRate: 0,
  critDamage: 0,
  atkPercentBonus: 0,
  flatAttack: 0,
  mainAttributeFlat: 0,
  subAttributeFlat: 0,
  mainAttribute: 0,
  subAttribute: 0,
  mainAttributeTag: '',
  subAttributeTag: '',
  allSkillBonus: 0,
  statPercentBonus: 0,
  physBonus: 0,
  thermalBonus: 0,
  electroBonus: 0,
  cryoBonus: 0,
  natureBonus: 0,
  normalAtkBonus: 0,
  skillBonus: 0,
  comboBonus: 0,
  ultimateBonus: 0,
  staggerBonus: 0,
  originiumArtBonus: 0,
  dmgBonus: 0,
  amplification: 0,
  vulnerability: 0,
  fragility: 0,
  staggerVuln: 0,
  comboMultiplier: 0,
  specialMultiplier: 0,
  resistancePen: 0,
  specialStatBonus: 0
}

const formData = ref<Operator>({ ...initialFormState })

const showSuccessMessage = (message: string) => {
  successMessage.value = message

  if (successTimer) {
    clearTimeout(successTimer)
  }

  successTimer = setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const submitOperator = () => {
  if (!formData.value.name) {
    alert('请输入角色名称！')
    return
  }

  const newOperator = { ...formData.value }
  gameData.addOperator(newOperator)
  showSuccessMessage(`角色 [${newOperator.name}] 已添加！`)
  formData.value = { ...initialFormState }
}

const deleteOperator = (name: string) => {
  if (operators.value.length <= 1) {
    alert('至少保留一个角色，避免计算器失去可选项。')
    return
  }

  gameData.removeOperator(name)
  calcStore.handleOperatorRemoved(name)
  showSuccessMessage(`角色 [${name}] 已删除！`)
}
</script>

<style scoped>
.add-view-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.gradient-title {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  background-image: linear-gradient(120deg, #9be15d 0%, #00c6fb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: none;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.panel-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.divider-text {
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
}

.action-row {
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.success-msg {
  color: #10b981;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.manage-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.manage-count {
  font-weight: 700;
  color: #334155;
}

.manage-tip {
  color: #94a3b8;
}

.manage-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow: auto;
}

.manage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.manage-item-main {
  min-width: 0;
}

.manage-item-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  word-break: break-all;
}

.manage-item-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 0.85rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
