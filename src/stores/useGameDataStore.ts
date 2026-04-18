import { defineStore } from 'pinia'
import type { Operator, Equipment, Buff, SetEffect, Skill } from '../types'

import operatorData from '../data/operators.json'
import weaponData from '../data/weapons.json'
import armorData from '../data/armors.json'
import gloveData from '../data/gloves.json'
import accessoryData from '../data/accessories.json'
import buffData from '../data/buffs.json'
import setData from '../data/sets.json'
import skillData from '../data/skills.json'
import foodData from '../data/foods.json'

type NamedEntity = { name: string }

export interface PersistedGameDataState {
  customOperators: Operator[]
  customWeapons: Equipment[]
  customArmors: Equipment[]
  customGloves: Equipment[]
  customAccessories: Equipment[]
  customBuffs: Buff[]
  customSkills: Skill[]
  removedOperatorNames: string[]
  removedWeaponNames: string[]
  removedArmorNames: string[]
  removedGloveNames: string[]
  removedAccessoryNames: string[]
  removedBuffNames: string[]
  removedSkillNames: string[]
}

interface LegacyGameDataState {
  operators?: Operator[]
  weapons?: Equipment[]
  armors?: Equipment[]
  gloves?: Equipment[]
  accessories?: Equipment[]
  availableBuffs?: Buff[]
  skills?: Skill[]
}

const baseOperators = operatorData as Operator[]
const baseWeapons = weaponData as Equipment[]
const baseArmors = armorData as Equipment[]
const baseGloves = gloveData as Equipment[]
const baseAccessories = accessoryData as Equipment[]
const baseBuffs = buffData as Buff[]
const baseSets = setData as SetEffect[]
const baseFoods = foodData as Equipment[]
const baseSkills = skillData as Skill[]

const removeName = (items: string[], name: string) => items.filter((item) => item !== name)

const uniqueByName = <T extends NamedEntity>(items: T[]) => {
  const map = new Map<string, T>()

  items.forEach((item) => {
    map.set(item.name, item)
  })

  return Array.from(map.values())
}

const mergeByName = <T extends NamedEntity>(base: T[], custom: T[], removedNames: string[]) => {
  const removed = new Set(removedNames)
  const map = new Map<string, T>()

  base.forEach((item) => {
    if (!removed.has(item.name)) {
      map.set(item.name, item)
    }
  })

  uniqueByName(custom).forEach((item) => {
    map.set(item.name, item)
  })

  return Array.from(map.values())
}

const upsertCustomItem = <T extends NamedEntity>(items: T[], newItem: T) => {
  const nextItems = items.filter((item) => item.name !== newItem.name)
  nextItems.push(newItem)
  return nextItems
}

const createInitialPersistedState = (): PersistedGameDataState => ({
  customOperators: [],
  customWeapons: [],
  customArmors: [],
  customGloves: [],
  customAccessories: [],
  customBuffs: [],
  customSkills: [],
  removedOperatorNames: [],
  removedWeaponNames: [],
  removedArmorNames: [],
  removedGloveNames: [],
  removedAccessoryNames: [],
  removedBuffNames: [],
  removedSkillNames: []
})

const splitLegacyEntries = <T extends NamedEntity>(persistedItems: T[] | undefined, baseItems: T[]) => {
  const persisted = uniqueByName(persistedItems ?? [])
  const baseNameSet = new Set(baseItems.map((item) => item.name))
  const persistedNameSet = new Set(persisted.map((item) => item.name))

  return {
    custom: persisted.filter((item) => !baseNameSet.has(item.name)),
    removed: baseItems.filter((item) => !persistedNameSet.has(item.name)).map((item) => item.name)
  }
}

export const migrateLegacyGameDataState = (legacyState: LegacyGameDataState): PersistedGameDataState => {
  const operators = splitLegacyEntries(legacyState.operators, baseOperators)
  const weapons = splitLegacyEntries(legacyState.weapons, baseWeapons)
  const armors = splitLegacyEntries(legacyState.armors, baseArmors)
  const gloves = splitLegacyEntries(legacyState.gloves, baseGloves)
  const accessories = splitLegacyEntries(legacyState.accessories, baseAccessories)
  const buffs = splitLegacyEntries(legacyState.availableBuffs, baseBuffs)
  const skills = splitLegacyEntries(legacyState.skills, baseSkills)

  return {
    customOperators: operators.custom,
    customWeapons: weapons.custom,
    customArmors: armors.custom,
    customGloves: gloves.custom,
    customAccessories: accessories.custom,
    customBuffs: buffs.custom,
    customSkills: skills.custom,
    removedOperatorNames: operators.removed,
    removedWeaponNames: weapons.removed,
    removedArmorNames: armors.removed,
    removedGloveNames: gloves.removed,
    removedAccessoryNames: accessories.removed,
    removedBuffNames: buffs.removed,
    removedSkillNames: skills.removed
  }
}

const isBaseItem = <T extends NamedEntity>(base: T[], name: string) => base.some((item) => item.name === name)

export const useGameDataStore = defineStore('gameData', {
  state: (): PersistedGameDataState => createInitialPersistedState(),

  getters: {
    operators(state): Operator[] {
      return mergeByName(baseOperators, state.customOperators, state.removedOperatorNames)
    },
    weapons(state): Equipment[] {
      return mergeByName(baseWeapons, state.customWeapons, state.removedWeaponNames)
    },
    armors(state): Equipment[] {
      return mergeByName(baseArmors, state.customArmors, state.removedArmorNames)
    },
    gloves(state): Equipment[] {
      return mergeByName(baseGloves, state.customGloves, state.removedGloveNames)
    },
    accessories(state): Equipment[] {
      return mergeByName(baseAccessories, state.customAccessories, state.removedAccessoryNames)
    },
    availableBuffs(state): Buff[] {
      return mergeByName(baseBuffs, state.customBuffs, state.removedBuffNames)
    },
    sets(): SetEffect[] {
      return baseSets
    },
    foods(): Equipment[] {
      return baseFoods
    },
    skills(state): Skill[] {
      return mergeByName(baseSkills, state.customSkills, state.removedSkillNames)
    }
  },

  actions: {
    addOperator(newOperator: Operator) {
      this.customOperators = upsertCustomItem(this.customOperators, newOperator)
      this.removedOperatorNames = removeName(this.removedOperatorNames, newOperator.name)
    },
    addWeapon(newWeapon: Equipment) {
      this.customWeapons = upsertCustomItem(this.customWeapons, newWeapon)
      this.removedWeaponNames = removeName(this.removedWeaponNames, newWeapon.name)
    },
    addArmor(newArmor: Equipment) {
      this.customArmors = upsertCustomItem(this.customArmors, newArmor)
      this.removedArmorNames = removeName(this.removedArmorNames, newArmor.name)
    },
    addGlove(newGlove: Equipment) {
      this.customGloves = upsertCustomItem(this.customGloves, newGlove)
      this.removedGloveNames = removeName(this.removedGloveNames, newGlove.name)
    },
    addAccessory(newAccessory: Equipment) {
      this.customAccessories = upsertCustomItem(this.customAccessories, newAccessory)
      this.removedAccessoryNames = removeName(this.removedAccessoryNames, newAccessory.name)
    },
    addBuff(newBuff: Buff) {
      this.customBuffs = upsertCustomItem(this.customBuffs, newBuff)
      this.removedBuffNames = removeName(this.removedBuffNames, newBuff.name)
    },
    addSkill(newSkill: Skill) {
      this.customSkills = upsertCustomItem(this.customSkills, newSkill)
      this.removedSkillNames = removeName(this.removedSkillNames, newSkill.name)
    },
    removeWeapon(name: string) {
      this.customWeapons = this.customWeapons.filter((item) => item.name !== name)
      if (isBaseItem(baseWeapons, name) && !this.removedWeaponNames.includes(name)) {
        this.removedWeaponNames.push(name)
      }
    },
    removeOperator(name: string) {
      this.customOperators = this.customOperators.filter((item) => item.name !== name)
      if (isBaseItem(baseOperators, name) && !this.removedOperatorNames.includes(name)) {
        this.removedOperatorNames.push(name)
      }
    },
    removeArmor(name: string) {
      this.customArmors = this.customArmors.filter((item) => item.name !== name)
      if (isBaseItem(baseArmors, name) && !this.removedArmorNames.includes(name)) {
        this.removedArmorNames.push(name)
      }
    },
    removeGlove(name: string) {
      this.customGloves = this.customGloves.filter((item) => item.name !== name)
      if (isBaseItem(baseGloves, name) && !this.removedGloveNames.includes(name)) {
        this.removedGloveNames.push(name)
      }
    },
    removeAccessory(name: string) {
      this.customAccessories = this.customAccessories.filter((item) => item.name !== name)
      if (isBaseItem(baseAccessories, name) && !this.removedAccessoryNames.includes(name)) {
        this.removedAccessoryNames.push(name)
      }
    },
    removeBuff(name: string) {
      this.customBuffs = this.customBuffs.filter((item) => item.name !== name)
      if (isBaseItem(baseBuffs, name) && !this.removedBuffNames.includes(name)) {
        this.removedBuffNames.push(name)
      }
    },
    removeSkill(name: string) {
      this.customSkills = this.customSkills.filter((item) => item.name !== name)
      if (isBaseItem(baseSkills, name) && !this.removedSkillNames.includes(name)) {
        this.removedSkillNames.push(name)
      }
    }
  },

  persist: true
})
