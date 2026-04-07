// src/composables/useDamageCalculator.ts
import { computed, type Ref, type ComputedRef } from 'vue'
import type {
  Operator, Equipment, Buff, SetEffect, Action, Rotation
} from '../types'


interface CalculatorInputs {
  operator: Ref<Operator>;         // 选中的干员基础属性
  weapon: Ref<Equipment>;          // 选中的武器
  armor: Ref<Equipment>;           // 选中的护甲
  glove: Ref<Equipment>;           // 选中的护手
  accessory1: Ref<Equipment>;      // 选中的配件1
  accessory2: Ref<Equipment>;      // 选中的配件2
  set: Ref<SetEffect>;             // 激活的套装效果
  food: Ref<Buff>;                 // 选中的食物
  rotation: Ref<Rotation> | ComputedRef<Rotation>;

}


export function useDamageCalculator(inputs: CalculatorInputs) {
  // 解构提取参数，方便后续直接使用
  const {
    operator,
    weapon,
    armor,
    glove,
    accessory1,
    accessory2,
    set,
    food,
    rotation,
  } = inputs;

  const sumStaticAttribute = (attr:
    'strength' | 'agility' | 'intelligence' | 'willpower' | // 四基础属性
    'baseAttack' | 'atkPercentBonus' | 'critRate' | 'critDamage' | 'flatAttack' | // 基础攻击力, 百分比攻击力加成, 暴击率, 暴击伤害, 固定攻击力加成
    'originiumArtBonus' | 'amplification' | 'fragility' | 'vulnerability' | 'dmgBonus' |// 源石技艺系数, 增幅加成, 脆弱加成, 易伤加成, 伤害加成
    'physBonus' | 'thermalBonus' | 'electroBonus' | 'cryoBonus' | 'natureBonus' |//物理加成,灼热加成,电磁加成,寒冷加成,自然加成
    'normalAtkBonus' | 'skillBonus' | 'comboBonus' | 'ultimateBonus' |//普攻加成,战技加成,连携技加成,终结技加成
    'mainAttributeTag' | 'subAttributeTag' |// 主辅属性
    'mainAttributeFlat' | 'subAttributeFlat' |// 如楔子132主能力
    'mainAttribute' | 'subAttribute' // 如主能力版
  ) => {
    return computed(() =>
      Number(operator.value[attr] || 0) +      // 干员自带
      Number(weapon.value[attr] || 0) +        // 武器提供
      Number(armor.value[attr] || 0) +         // 护甲提供
      Number(glove.value[attr] || 0) +         // 护手提供
      Number(accessory1.value[attr] || 0) +    // 配件1提供
      Number(accessory2.value[attr] || 0) +    // 配件2提供
      Number(set.value[attr] || 0) +           // 套装提供（容错处理，防止未选择套装时报错）
      Number(food.value[attr] || 0)            //食物提供
    )
  }

const totalStrength = computed(() => {
  return ('力量' === operator.value.mainAttributeTag)
    ? ((sumStaticAttribute('strength').value + sumStaticAttribute('mainAttributeFlat').value) * (1 + sumStaticAttribute('mainAttribute').value))
    : sumStaticAttribute('strength').value;
})


const totalAgility = computed(() => {
  return ('敏捷' === operator.value.mainAttributeTag)
    ? ((sumStaticAttribute('agility').value + sumStaticAttribute('mainAttributeFlat').value) * (1 + sumStaticAttribute('mainAttribute').value))
    : sumStaticAttribute('agility').value;
})



const totalIntelligence = computed(() => {
  return ('智识' === operator.value.mainAttributeTag)
    ? ((sumStaticAttribute('intelligence').value + sumStaticAttribute('mainAttributeFlat').value) * (1 + sumStaticAttribute('mainAttribute').value))
    : sumStaticAttribute('intelligence').value;
})


const totalWillpower = computed(() => {
  return ('意志' === operator.value.mainAttributeTag)
    ? ((sumStaticAttribute('willpower').value + sumStaticAttribute('mainAttributeFlat').value) * (1 + sumStaticAttribute('mainAttribute').value))
    : sumStaticAttribute('willpower').value;
})



  const ifMain = (attrName: string | undefined) => {
    if (attrName == operator.value.mainAttributeTag) return true
    return false
  }

  const ifSub = (attrName: string | undefined) => {
    if (attrName == operator.value.subAttributeTag) return true
    return false
  }
  const getMainVal = () => {
    if (ifMain('力量')) return totalStrength.value
    if (ifMain('敏捷')) return totalAgility.value
    if (ifMain('智识')) return totalIntelligence.value
    if (ifMain('意志')) return totalWillpower.value
    return 0
  }
  const getSubVal = () => {
    if (ifSub('力量')) return totalStrength.value
    if (ifSub('敏捷')) return totalAgility.value
    if (ifSub('智识')) return totalIntelligence.value
    if (ifSub('意志')) return totalWillpower.value
    return 0
  }


  //能力值转化
  const attributeBonus = computed(() => {
    const mainVal = getMainVal()
    const subVal = getSubVal()
    return (Math.floor(mainVal) * 0.5 + Math.floor(subVal) * 0.2) / 100
  })

  const staticCritRate = computed(() => Math.min(sumStaticAttribute('critRate').value, 1))
  const staticCritDamage = sumStaticAttribute('critDamage')

  // Step A: 基础攻击力 = 干员攻击 + 武器攻击
  const stepA_BaseAttack = computed(() => operator.value.baseAttack + weapon.value.baseAttack)

  // 防御区、(目前阶段静态)
  const totalDefense = 0.5;

  const calculateActionDamage = (action: Action) => {
    const { skill, activeBuffs } = action;

    const sumBuff = (key: keyof Buff) => activeBuffs.reduce((sum, b) => sum + (Number(b[key]) || 0), 0)

    // --- 动态面板 ---

    // 动态暴击率 = 静态暴击率 + 技能自带暴击 + Buff暴击
    const currentCritRate = Math.min(staticCritRate.value + skill.extraCritRate + sumBuff('critRate'), 1);
    // 动态暴伤 = 静态暴伤 + 技能自带暴伤 + Buff暴伤
    const currentCritDamage = staticCritDamage.value + skill.extraCritDamage + sumBuff('critDamage');

    // 百分比攻击力加成 = 静态(装备/套装) + 动态(Buff)
    const currentPercentAttack = sumStaticAttribute('atkPercentBonus').value + sumBuff('atkPercentBonus');
    // 固定攻击力加成 = 静态(装备/套装) + 动态(Buff)
    const currentFlatAttack = sumStaticAttribute('flatAttack').value + sumBuff('flatAttack');

    // 独立乘区汇总： = 静态(装备) + 动态(Buff) + 技能特定逻辑
    const currentDmgBonus = sumStaticAttribute('dmgBonus').value + sumBuff('dmgBonus') + skill.dmgBonus
      + (skill.elemType == '物理加成' ? sumStaticAttribute('physBonus').value : 0)
      + (skill.elemType == '灼热加成' ? sumStaticAttribute('thermalBonus').value : 0)
      + (skill.elemType == '电磁加成' ? sumStaticAttribute('electroBonus').value : 0)
      + (skill.elemType == '寒冷加成' ? sumStaticAttribute('cryoBonus').value : 0)
      + (skill.elemType == '自然加成' ? sumStaticAttribute('natureBonus').value : 0)
      + (skill.skillType == '普攻加成' ? sumStaticAttribute('normalAtkBonus').value : 0)
      + (skill.skillType == '战技加成' ? sumStaticAttribute('skillBonus').value : 0)
      + (skill.skillType == '连携技加成' ? sumStaticAttribute('comboBonus').value : 0)
      + (skill.skillType == '终结技加成' ? sumStaticAttribute('ultimateBonus').value : 0);

    const currentVulnerability = sumStaticAttribute('vulnerability').value + sumBuff('vulnerability') + skill.vulnerability;
    const currentFragility = sumStaticAttribute('fragility').value + sumBuff('fragility') + skill.fragility;
    const currentAmplification = sumStaticAttribute('amplification').value + sumBuff('amplification') + skill.amplification;
    const currentOriginiumArtBonus = sumStaticAttribute('originiumArtBonus').value + sumBuff('originiumArtBonus');
    const currentComboMultiplier = 
    // sumStaticAttribute('comboMultiplier').value 
    + sumBuff('comboMultiplier');

    // Step B: 百分比加成后攻击力 = 白字 * (1 + 百分比攻击之和)
    const stepB_PercentScaled = stepA_BaseAttack.value * (1 + currentPercentAttack);

    // Step C: 固定加成后攻击力 = 百分比结算后的攻击力 + 固定攻击力
    const stepC_FlatAdded = stepB_PercentScaled + currentFlatAttack;

    // 面板最终攻击力 = 固定加成后的攻击力 * (1 + 能力转化加成比例)
    const finalAttack = stepC_FlatAdded * (1 + attributeBonus.value);

    // 技能基础伤害 = 最终攻击力 * 技能倍率
    const stepD_SkillBaseDamage = finalAttack * skill.multiplier;

    // 独立乘区总系数计算 各独立乘区之间做乘法：(防御)*(1+增伤)*(1+易伤)*(1+脆弱)*(1+增幅)*(1+特殊系数物理)*(1+源石技艺系数*源石技艺)*(1+连击)*(1+无视抗性)
    const stepE_MultiplierTotal = totalDefense * (1 + currentDmgBonus) * (1 + currentVulnerability)
      * (1 + currentFragility) * (1 + currentAmplification) * (1 + skill.specialMultiplier)
      * (1 + skill.originiumArtBonus * currentOriginiumArtBonus)
      * (1 + currentComboMultiplier) * (1 + sumBuff('resistancePen'));



    // 最终不暴击伤害 = 技能基础伤害 * 独立乘区总系数
    const finalNonCritDamage = stepD_SkillBaseDamage * stepE_MultiplierTotal;

    // 最终暴击时的伤害 = 不暴击伤害 * (暴击伤害加成)
    const finalCritHitDamage = finalNonCritDamage * currentCritDamage;

    // 平均伤害期望 = [不暴击伤害 * (1 - 暴击率) + 暴击伤害 * 暴击率] * hits
    const finalExpectedDamage = (finalNonCritDamage * (1 - currentCritRate) + finalCritHitDamage * currentCritRate) * action.hits;

    // 全暴击伤害 = 最终暴击时的伤害 * hits
    const finalCritDamage = finalCritHitDamage * action.hits;

    // 返回动作结算的完整快照
    return {
      actionId: action.id,
      actionName: action.name,
      skill,
      activeBuffs,

      // 快照面板数据
      currentCritRate,
      currentCritDamage,
      currentPercentAttack,
      currentFlatAttack,
      currentDmgBonus,
      currentVulnerability,
      currentFragility,
      currentAmplification,
      currentOriginiumArtBonus,

      // 核心链路数据
      stepA_BaseAttack: stepA_BaseAttack.value,
      stepB_PercentScaled,
      stepC_FlatAdded,
      finalAttack,
      stepE_MultiplierTotal,

      // 最终伤害数据
      finalNonCritDamage,
      finalCritHitDamage,
      finalExpectedDamage,
      finalCritDamage
    }
  }


  // 遍历 rotation 数组，推导出每个Action的伤害
  const rotationResults = computed(() => {
    return rotation.value.map(action => calculateActionDamage(action));
  })

  // 汇总整套输出的总伤
  const totalRotationDamage = computed(() => {
    return rotationResults.value.reduce((sum, result) => sum + result.finalExpectedDamage, 0);
  })

  // 暴露出视图
  return {
    // 静态面板数据
    totalStrength, totalAgility, totalIntelligence, totalWillpower,
    attributeBonus, stepA_BaseAttack, totalDefense,


    rotationResults,       // 包含每个动作过程的数组
    totalRotationDamage,   // 一套轴的总伤害
    totalCritDamage: computed(() => rotationResults.value.reduce((sum, r) => sum + r.finalCritDamage, 0)), // 一套轴的总全暴击伤害

    calculateActionDamage
  }
}