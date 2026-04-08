<template>
  <div class="add-view-container">
    <div class="page-header">
      <h1 class="gradient-title">添加新技能</h1>
      <p class="subtitle">在这里添加的自定义技能，将直接出现在动作序列的技能下拉中。</p>
    </div>

    <div class="panel-section glass-panel">
      <n-grid :x-gap="24" :y-gap="20" cols="1 s:2" responsive="screen">
        <n-grid-item>
          <label class="form-label">技能名称 <span class="required">*</span></label>
          <n-input v-model:value="formData.name" placeholder="例如：3层猛击" size="large" clearable />
        </n-grid-item>
        <n-grid-item>
          <label class="form-label">技能倍率</label>
          <n-input-number v-model:value="formData.multiplier" :step="0.01" :format="formatPercent" :parse="parsePercent"
            clearable placeholder="0">
            <template #suffix>%</template>
          </n-input-number>
        </n-grid-item>
      </n-grid>

      <n-divider dashed>
        <span class="divider-text">技能标签</span>
      </n-divider>

      <n-grid :x-gap="24" :y-gap="20" cols="1 s:2" responsive="screen">
        <n-grid-item>
          <label class="form-label">元素区</label>
          <n-select v-model:value="formData.elemType" :options="elemTypeOptions" />
        </n-grid-item>
        <n-grid-item>
          <label class="form-label">技能区</label>
          <n-select v-model:value="formData.skillType" :options="skillTypeOptions" />
        </n-grid-item>
      </n-grid>

      <n-divider dashed>
        <span class="divider-text">暴击与乘区</span>
      </n-divider>

      <n-grid :x-gap="24" :y-gap="20" cols="2 s:3 m:4" responsive="screen">
        <n-grid-item v-for="field in percentFields" :key="field.key">
          <label class="form-label">{{ field.label }}</label>
          <n-input-number v-model:value="formData[field.key]" :step="0.01" :format="formatPercent" :parse="parsePercent"
            clearable placeholder="0">
            <template #suffix>%</template>
          </n-input-number>
        </n-grid-item>

        <n-grid-item>
          <label class="form-label">源石技艺系数</label>
          <n-input-number v-model:value="formData.originiumArtBonus" :step="1" clearable placeholder="0" />
        </n-grid-item>
      </n-grid>

      <div class="action-row">
        <n-button size="large" ghost color="#8B5CF6" @click="submitSkill">
          保存技能并生效
        </n-button>
        <transition name="fade">
          <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NInputNumber, NGrid, NGridItem, NDivider, NButton, NSelect } from 'naive-ui'
import { useGameDataStore } from '../stores/useGameDataStore'
import type { Skill } from '../types'

const gameData = useGameDataStore()
const successMessage = ref('')

type SkillPercentKey =
  | 'extraCritRate'
  | 'extraCritDamage'
  | 'dmgBonus'
  | 'amplification'
  | 'fragility'
  | 'vulnerability'
  | 'staggerVuln'
  | 'resistancePen'
  | 'comboMultiplier'
  | 'specialMultiplier'

interface SkillFieldConfig {
  label: string
  key: SkillPercentKey
}

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

const elemTypeOptions = [
  { label: '物理加成', value: '物理加成' },
  { label: '灼热加成', value: '灼热加成' },
  { label: '电磁加成', value: '电磁加成' },
  { label: '寒冷加成', value: '寒冷加成' },
  { label: '自然加成', value: '自然加成' }
]

const skillTypeOptions = [
  { label: '无', value: '无' },
  { label: '普攻加成', value: '普攻加成' },
  { label: '战技加成', value: '战技加成' },
  { label: '连携技加成', value: '连携技加成' },
  { label: '终结技加成', value: '终结技加成' }
]

const percentFields: SkillFieldConfig[] = [
  { label: '额外暴击率', key: 'extraCritRate' },
  { label: '额外暴击伤害', key: 'extraCritDamage' },
  { label: '伤害加成', key: 'dmgBonus' },
  { label: '增幅加成', key: 'amplification' },
  { label: '脆弱加成', key: 'fragility' },
  { label: '易伤加成', key: 'vulnerability' },
  { label: '失衡易伤', key: 'staggerVuln' },
  { label: '减抗加成', key: 'resistancePen' },
  { label: '连击加成', key: 'comboMultiplier' },
  { label: '特殊乘区', key: 'specialMultiplier' }
]

const initialFormState: Skill = {
  name: '',
  multiplier: 0,
  extraCritRate: 0,
  extraCritDamage: 0,
  dmgBonus: 0,
  originiumArtBonus: 0,
  amplification: 0,
  fragility: 0,
  vulnerability: 0,
  staggerVuln: 0,
  resistancePen: 0,
  comboMultiplier: 0,
  specialMultiplier: 0,
  elemType: '物理加成',
  skillType: '无',
  isStagger: false
}

const formData = ref<Skill>({ ...initialFormState })

const submitSkill = () => {
  if (!formData.value.name) {
    alert('请输入技能名称！')
    return
  }

  const newSkill = { ...formData.value }
  gameData.addSkill(newSkill)

  successMessage.value = `技能 [${newSkill.name}] 已添加！`

  setTimeout(() => {
    successMessage.value = ''
    formData.value.name = ''
  }, 3000)
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
  background-image: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
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
