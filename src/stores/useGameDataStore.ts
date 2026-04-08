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

export const useGameDataStore = defineStore('gameData', {
  state: () => ({
    operators: operatorData as Operator[],
    weapons: weaponData as Equipment[],
    armors: armorData as Equipment[],
    gloves: gloveData as Equipment[],
    accessories: accessoryData as Equipment[],
    availableBuffs: buffData as Buff[],
    sets: setData as SetEffect[],
    foods: foodData as Equipment[],
    skills: skillData as Skill[]
  }),

  actions: {
    addWeapon(newWeapon: Equipment) {
      this.weapons.push(newWeapon)
    },
    addArmor(newArmor: Equipment) {
      this.armors.push(newArmor)
    },
    addBuff(newBuff: Buff) {
      this.availableBuffs.push(newBuff)
    },
    addSkill(newSkill: Skill) {
      this.skills.push(newSkill)
    }
  },
  persist: true
})
