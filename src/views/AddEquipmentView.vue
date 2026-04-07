<template>
  <div class="add-view-container">
    <div class="page-header">
      <h1 class="gradient-title text-emerald">添加装备</h1>
      <p class="subtitle">在这里添加的自定义装备，将直接同步到计算器的下拉列表中。</p>
    </div>

    <div class="panel-section glass-panel">
      <n-grid :x-gap="24" :y-gap="20" cols="1 s:2" responsive="screen">
        <n-grid-item>
          <label class="form-label">装备类型 <span class="required">*</span></label>
          <n-select v-model:value="formData.type" :options="typeOptions" size="large" />
        </n-grid-item>
        <n-grid-item>
          <label class="form-label">装备名称 <span class="required">*</span></label>
          <n-input v-model:value="formData.name" placeholder="例如: 宏愿2潜" size="large" clearable />
        </n-grid-item>
      </n-grid>

      <n-divider dashed>
        <span class="divider-text">四维与基础能力</span>
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
        <span class="divider-text">属性与伤害加成</span>
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
        <n-button size="large" ghost color="#86A7DA" @click="submitEquipment">
          保存装备并生效
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
import { NInput, NInputNumber, NSelect, NGrid, NGridItem, NDivider, NButton } from 'naive-ui'
import { useGameDataStore } from '../stores/useGameDataStore'
import type { Equipment } from '../types'

const gameData = useGameDataStore()
const successMessage = ref('')

// 定义 isPercent 标记
interface FieldConfig {
  label: string;
  key: string;
  step?: number;
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

const typeOptions = [
  { label: '武器', value: 'weapon' },
  { label: '护甲', value: 'armor' },
  { label: '护手', value: 'glove' },
  { label: '配件', value: 'accessory' }
]

const baseFields: FieldConfig[] = [
  { label: '力量', key: 'strength' },
  { label: '敏捷', key: 'agility' },
  { label: '智识', key: 'intelligence' },
  { label: '意志', key: 'willpower' },
  { label: '主能力', key: 'mainAttributeFlat' },
  { label: '副能力', key: 'subAttributeFlat' },
  { label: '基础攻击力', key: 'baseAttack' },
  { label: '暴击率', key: 'critRate', isPercent: true },   // 百分比
  { label: '暴击伤害', key: 'critDamage', isPercent: true }, // 百分比
];

const advancedFields: FieldConfig[] = [
  { label: '攻击力加成', key: 'atkPercentBonus', isPercent: true },
  { label: '主属性加成', key: 'mainAttribute', isPercent: true },
  { label: '副属性加成', key: 'subAttribute', isPercent: true },
  { label: '物理加成', key: 'physBonus', isPercent: true },
  { label: '灼热加成', key: 'thermalBonus', isPercent: true },
  { label: '电磁加成', key: 'electroBonus', isPercent: true },
  { label: '寒冷加成', key: 'cryoBonus', isPercent: true },
  { label: '自然加成', key: 'natureBonus', isPercent: true },
  { label: '战技加成', key: 'skillBonus', isPercent: true },
  { label: '连携技加成', key: 'comboBonus', isPercent: true },
  { label: '终结技加成', key: 'ultimateBonus', isPercent: true },
  { label: '失衡伤害加成', key: 'staggerBonus', isPercent: true },
];

const initialFormState = {
  type: 'weapon', name: '', strength: 0, agility: 0, intelligence: 0, willpower: 0,
  critRate: 0, critDamage: 0, physBonus: 0, normalAtkBonus: 0, baseAttack: 0,
  mainAttributeFlat: 0, subAttributeFlat: 0, thermalBonus: 0, electroBonus: 0,
  cryoBonus: 0, natureBonus: 0, staggerBonus: 0, originiumArtBonus: 0, comboBonus: 0,
  ultimateBonus: 0, skillBonus: 0, atkPercentBonus: 0, mainAttribute: 0, subAttribute: 0,
}

const formData = ref<any>({ ...initialFormState })

const submitEquipment = () => {
  if (!formData.value.name) {
    alert('请输入装备名称！')
    return
  }

  const newEquipment = { ...formData.value }
  delete newEquipment.type

  switch (formData.value.type) {
    case 'weapon': gameData.addWeapon(newEquipment as Equipment); break;
    case 'armor': gameData.addArmor(newEquipment as Equipment); break;
    case 'glove': gameData.gloves.push(newEquipment as Equipment); break;
    case 'accessory': gameData.accessories.push(newEquipment as Equipment); break;
  }

  successMessage.value = `装备 [${newEquipment.name}] 锻造成功！`

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

.text-emerald {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  background-image: linear-gradient(to top, #a3bded 0%, #6991c7 100%);
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

.emerald-btn {
  background-color: #10b981;
  border-color: #10b981;
  transition: all 0.3s ease;
}

.emerald-btn:hover {
  background-color: #059669;
  border-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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