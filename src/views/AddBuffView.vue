<template>
  <div class="add-view-container">
    <div class="page-header">
      <h1 class="gradient-title">添加新增益</h1>
      <p class="subtitle">在这里添加的自定义增益，将在排轴面板的“临时增益”中可用。</p>
    </div>

    <div class="panel-section glass-panel">
      <n-grid :cols="1" :y-gap="20">
        <n-grid-item>
          <label class="form-label">增益名称 <span class="required">*</span></label>
          <n-input v-model:value="formData.name" placeholder="例如：悼亡诗3潜加攻" size="large" clearable />
        </n-grid-item>
      </n-grid>

      <n-divider dashed>
        <span class="divider-text">乘区加成</span>
      </n-divider>

      <n-grid :x-gap="24" :y-gap="20" cols="2 s:3 m:4" responsive="screen">
        <n-grid-item v-for="field in buffFields" :key="field.key">
          <label class="form-label">{{ field.label }}</label>
          <n-input-number 
            v-model:value="formData[field.key]" 
            :step="0.01" 
            :format="field.isPercent ? formatPercent : undefined"
            :parse="field.isPercent ? parsePercent : undefined"
            clearable 
            placeholder="0"
          >
            <template #suffix v-if="field.isPercent">%</template>
          </n-input-number>
        </n-grid-item>
      </n-grid>

      <div class="action-row">
        <n-button size="large" ghost color="#E8A3BE" @click="submitBuff">
          保存增益并生效
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
import { NInput, NInputNumber, NGrid, NGridItem, NDivider, NButton } from 'naive-ui'
import { useGameDataStore } from '../stores/useGameDataStore'
import type { Buff } from '../types/index.ts'

const gameData = useGameDataStore()
const successMessage = ref('')

interface BuffFieldConfig {
  label: string;
  key: keyof Buff;
  isPercent?: boolean;
}

// 转为显示用百分比
const formatPercent = (value: number | null): string => {
  if (value === null || value === undefined) return '';
  return String(Number((value * 100).toFixed(2)));
}

// 百分比转回小数
const parsePercent = (input: string): number | null => {
  if (!input) return null;
  const num = parseFloat(input);
  if (isNaN(num)) return null;
  return Number((num / 100).toFixed(4));
}

const buffFields: BuffFieldConfig[] = [
  { label: '额外暴击率', key: 'critRate', isPercent: true },
  { label: '额外暴伤', key: 'critDamage', isPercent: true },
  { label: '伤害加成', key: 'dmgBonus', isPercent: true },
  { label: '技能加成', key: 'allSkillBonus', isPercent: true },
  { label: '源石技艺加成', key: 'originiumArtBonus', isPercent: true },
  { label: '增幅加成', key: 'amplification', isPercent: true },
  { label: '脆弱加成', key: 'fragility', isPercent: true },
  { label: '易伤加成', key: 'vulnerability', isPercent: true },
  { label: '减抗加成', key: 'resistancePen', isPercent: true },
  { label: '连击加成', key: 'comboMultiplier', isPercent: true },
  { label: '攻击加成', key: 'atkPercentBonus', isPercent: true },
  { label: '全能力加成', key: 'statPercentBonus', isPercent: true }
];

const initialFormState = {
  name: '', statPercentBonus: 0, critRate: 0, critDamage: 0, physBonus: 0,
  originiumArtBonus: 0, normalAtkBonus: 0, skillBonus: 0, thermalBonus: 0,
  electroBonus: 0, cryoBonus: 0, natureBonus: 0, comboBonus: 0, ultimateBonus: 0,
  staggerBonus: 0, strength: 0, agility: 0, intelligence: 0, willpower: 0,
  fragility: 0, vulnerability: 0, resistancePen: 0, comboMultiplier: 0,
  atkPercentBonus: 0, amplification: 0, dmgBonus: 0, allSkillBonus: 0,
} as Buff

const formData = ref<Buff>({ ...initialFormState })

const submitBuff = () => {
  if (!formData.value.name) {
    alert('请输入增益名称！')
    return
  }

  const newBuff = { ...formData.value }
  gameData.addBuff(newBuff)

  successMessage.value = `增益 [${newBuff.name}] 调配成功！`
  
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
  background-image: linear-gradient(120deg, #fccb90 0%, #d57eeb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  
  /* --- 修复黑边 --- */
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
.required { color: #ef4444; }
.divider-text { color: #94a3b8; font-weight: 600; font-size: 0.9rem; }

.action-row {
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.purple-btn {
  background-color: #9333ea;
  border-color: #9333ea;
  transition: all 0.3s ease;
}
.purple-btn:hover {
  background-color: #7e22ce;
  border-color: #7e22ce;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.success-msg {
  color: #10b981;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-10px); }
</style>