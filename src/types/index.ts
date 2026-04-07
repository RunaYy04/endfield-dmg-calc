// src/types/index.ts

export type AttributeType = '力量' | '敏捷' | '智识' | '意志' | '';


export interface DamageModifiers {

  physBonus: number;        // 物理加成
  thermalBonus: number;     // 灼热加成
  electroBonus: number;     // 电磁加成
  cryoBonus: number;        // 寒冷加成
  natureBonus: number;      // 自然加成


  normalAtkBonus: number;   // 普攻加成
  skillBonus: number;       // 战技加成
  comboBonus: number;       // 连携技加成
  ultimateBonus: number;    // 终结技加成


  staggerBonus: number;     // 失衡伤害加成
  originiumArtBonus: number; // 源石技艺强度


  dmgBonus: number;         // 伤害加成 (最常见的增伤区)
  amplification: number;    // 增幅加成
  vulnerability: number;    // 易伤加成 (作用于敌方)
  fragility: number;        // 脆弱加成
  staggerVuln: number;      // 失衡状态下的额外易伤
  comboMultiplier: number;  // 连击数带来的直接伤害倍率修正
  specialMultiplier: number; // 某些特殊天赋提供的独立倍率
  resistancePen: number;    // 抗性穿透
}


export interface BaseStats extends DamageModifiers {
  baseAttack: number;      // 基础攻击
  strength: number;        // 力量
  agility: number;         // 敏捷
  intelligence: number;    // 智识
  willpower: number;       // 意志
  critRate: number;        // 暴击率
  critDamage: number;      // 暴伤
  atkPercentBonus: number; // 攻击力百分比加成
  flatAttack: number;      // 固定攻击力
  mainAttributeFlat: number; // 如楔子132主能力
  subAttributeFlat: number;
  mainAttribute: any; //  仅声明
  subAttribute: any;//  仅声明
  mainAttributeTag: any;  //  仅声明
  subAttributeTag: any;  //  仅声明
  allSkillBonus: any;  //  仅声明
  statPercentBonus: any;      //  仅声明
}


export interface Operator extends BaseStats {
  name: string;
  mainAttributeTag: AttributeType;  // 主属性：如'力量'
  subAttributeTag: AttributeType;  // 副属性1：
  specialStatBonus?: number;      // 特殊系数
}

// 装备/套装接口
export interface Equipment extends BaseStats {
  name: string;
  mainAttribute: number; // 如主能力板+26.9%
  subAttribute: number;
}

// 增益 Buff 接口
export interface Buff extends BaseStats {
  name: string;
  allSkillBonus: number;   //技能加成
  statPercentBonus: number;
}

// 套装效果接口
export interface SetEffect extends BaseStats {
  name: string;
}


export interface Skill {
  name: string;
  multiplier: number;       // 技能倍率
  extraCritRate: number;    // 技能自带暴击
  extraCritDamage: number;  // 技能自带暴伤

  // 技能自身加成
  dmgBonus: number;           // 伤害加成
  originiumArtBonus: number;  // 源石技艺系数(0/1)
  amplification: number;      // 增幅加成
  fragility: number;          // 脆弱加成
  vulnerability: number;      // 易伤加成
  staggerVuln: number;        // 失衡加成
  resistancePen: number;      // 抗性区
  comboMultiplier: number;    // 连击加成
  specialMultiplier: number;  // 特殊加成


  elemType: string;
  skillType: string;

  isStagger: boolean;
}

export interface Action {
  id: string;          // ID
  name: string;        // 动作名称
  skill: Skill;        // 动作技能
  activeBuffs: Buff[]; // 该动作时，激活的 Buff 列表
  hits: number;
}

export type Rotation = Action[];

export interface Timeline {
  id: string;
  name: string;
  selectedOperator: Operator;
  selectedWeapon: Equipment;
  selectedArmor: Equipment;
  selectedGlove: Equipment;
  selectedFood: Equipment;
  selectedAccessory1: Equipment;
  selectedAccessory2: Equipment;
  selectedSet: SetEffect;
  rotation: Rotation;
}