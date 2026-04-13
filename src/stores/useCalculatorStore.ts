// src/stores/useCalculatorStore.ts
import { defineStore } from 'pinia'
import { useGameDataStore } from './useGameDataStore'
import type { Operator, Equipment, SetEffect, Rotation, Timeline, Skill } from '../types'

export const useCalculatorStore = defineStore('calculator', {
  state: () => {
    const gameData = useGameDataStore()
    const defaultId = Date.now().toString()
    
    const getDefaultBuild = () => ({
      selectedOperator: gameData.operators[0],
      selectedWeapon: gameData.weapons[0],
      selectedArmor: gameData.armors[0],
      selectedGlove: gameData.gloves[0],
      selectedAccessory1: gameData.accessories[0],
      selectedAccessory2: gameData.accessories[1],
      selectedSet: gameData.sets[0] || {} as SetEffect,
      selectedFood: gameData.foods[0],
    })

    return {
      timelines: [
        {
          id: defaultId,
          name: '默认排轴',
          ...getDefaultBuild(),
          rotation: [] as Rotation
        }
      ] as Timeline[],
      activeTimelineId: defaultId,
      actionBuffListExpanded: {} as Record<string, boolean>
    }
  },

getters: {
    activeTimeline(state): Timeline {
      return state.timelines.find(t => t.id === state.activeTimelineId) || state.timelines[0]
    },
    rotation(state): Rotation { return this.activeTimeline.rotation },
    selectedOperator(state): Operator { return this.activeTimeline.selectedOperator },
    selectedWeapon(state): Equipment { return this.activeTimeline.selectedWeapon },
    selectedArmor(state): Equipment { return this.activeTimeline.selectedArmor },
    selectedGlove(state): Equipment { return this.activeTimeline.selectedGlove },
    selectedAccessory1(state): Equipment { return this.activeTimeline.selectedAccessory1 },
    selectedAccessory2(state): Equipment { return this.activeTimeline.selectedAccessory2 },
    selectedSet(state): SetEffect { return this.activeTimeline.selectedSet },
    selectedFood(state): Equipment { return this.activeTimeline.selectedFood }
  },

  actions: {
    generateId() { return Date.now().toString() + Math.random().toString(36).substring(2) },
    syncEquipmentSelection(
      key: 'selectedWeapon' | 'selectedArmor' | 'selectedGlove' | 'selectedAccessory1' | 'selectedAccessory2' | 'selectedFood',
      removedName: string,
      fallback: Equipment | undefined
    ) {
      if (!fallback) return

      this.timelines.forEach((timeline) => {
        if (timeline[key]?.name === removedName) {
          timeline[key] = fallback
        }
      })
    },
    syncSkillSelection(removedName: string, fallback: Skill | undefined) {
      if (!fallback) return

      this.timelines.forEach((timeline) => {
        timeline.rotation.forEach((action) => {
          if (action.skill?.name === removedName) {
            action.skill = fallback
          }
        })
      })
    },

    addTimeline() {
      const gameData = useGameDataStore()
      const newId = this.generateId()
      this.timelines.push({
        id: newId,
        name: `新排轴 ${this.timelines.length + 1}`,
        selectedOperator: gameData.operators[0],
        selectedWeapon: gameData.weapons[0],
        selectedArmor: gameData.armors[0],
        selectedGlove: gameData.gloves[0],
        selectedAccessory1: gameData.accessories[0],
        selectedAccessory2: gameData.accessories[1],
        selectedSet: gameData.sets[0] || {} as SetEffect,
        selectedFood: gameData.foods[0],
        rotation: []
      })
      this.activeTimelineId = newId
      this.addAction()
    },

    copyTimeline(id: string) {
      const target = this.timelines.find(t => t.id === id)
      if (!target) return
      
      const newId = this.generateId()
      const clonedRotation = target.rotation.map(action => ({
        ...action,
        id: this.generateId(),
        activeBuffs: [...action.activeBuffs]
      }))

      this.timelines.push({
        ...target,
        id: newId,
        name: `${target.name} (副本)`,
        rotation: clonedRotation
      })
      this.activeTimelineId = newId
    },

    removeTimeline(id: string) {
      if (this.timelines.length <= 1) return
      const index = this.timelines.findIndex(t => t.id === id)
      if (index > -1) {
        this.timelines.splice(index, 1)
        if (this.activeTimelineId === id) {
          this.activeTimelineId = this.timelines[Math.max(0, index - 1)].id
        }
      }
    },


    addAction() {
      const gameData = useGameDataStore()
      const newId = this.generateId()
      this.actionBuffListExpanded[newId] = true

      this.activeTimeline.rotation.push({
        id: newId,
        name: `动作 ${this.activeTimeline.rotation.length + 1}`,
        skill: gameData.skills[0],
        activeBuffs: [],         
        hits: 1,
      })
    },


    copyAction(index: number) {
      const targetAction = this.activeTimeline.rotation[index]
      if (!targetAction) return

      const newId = this.generateId()
      this.actionBuffListExpanded[newId] = !!this.actionBuffListExpanded[targetAction.id]


      this.activeTimeline.rotation.splice(index + 1, 0, {
        ...targetAction,
        id: newId,
        name: `${targetAction.name} (副本)`,
        activeBuffs: [...targetAction.activeBuffs]
      })
    },

    removeAction(index: number) {
      const target = this.activeTimeline.rotation[index]
      if(target) {
        delete this.actionBuffListExpanded[target.id] 
        this.activeTimeline.rotation.splice(index, 1)
      }
    },

    toggleBuffList(actionId: string) {
      this.actionBuffListExpanded[actionId] = !this.actionBuffListExpanded[actionId]
    },

    handleSkillRemoved(removedName: string) {
      const gameData = useGameDataStore()
      this.syncSkillSelection(removedName, gameData.skills[0])
    },
    handleBuffRemoved(removedName: string) {
      this.timelines.forEach((timeline) => {
        timeline.rotation.forEach((action) => {
          action.activeBuffs = action.activeBuffs.filter((buff) => buff.name !== removedName)
        })
      })
    },

    handleEquipmentRemoved(
      type: 'weapon' | 'armor' | 'glove' | 'accessory',
      removedName: string
    ) {
      const gameData = useGameDataStore()

      switch (type) {
        case 'weapon':
          this.syncEquipmentSelection('selectedWeapon', removedName, gameData.weapons[0])
          break
        case 'armor':
          this.syncEquipmentSelection('selectedArmor', removedName, gameData.armors[0])
          break
        case 'glove':
          this.syncEquipmentSelection('selectedGlove', removedName, gameData.gloves[0])
          break
        case 'accessory':
          this.syncEquipmentSelection('selectedAccessory1', removedName, gameData.accessories[0])
          this.syncEquipmentSelection('selectedAccessory2', removedName, gameData.accessories[0] ?? gameData.accessories[1])
          break
      }
    }
  },
  persist: true
})
