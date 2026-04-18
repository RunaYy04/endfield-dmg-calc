import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { APP_DATA_VERSION_STORAGE_KEY, DATA_VERSION } from './constants/appVersion'
import { migrateLegacyGameDataState, useGameDataStore } from './stores/useGameDataStore'
import { useCalculatorStore } from './stores/useCalculatorStore'

const migrateLegacyGameDataCache = () => {
  const rawState = window.localStorage.getItem('gameData')
  if (!rawState) {
    return
  }

  try {
    const parsedState = JSON.parse(rawState)
    const isLegacyState =
      parsedState &&
      !('customOperators' in parsedState) &&
      (
        'operators' in parsedState ||
        'weapons' in parsedState ||
        'armors' in parsedState ||
        'gloves' in parsedState ||
        'accessories' in parsedState ||
        'availableBuffs' in parsedState ||
        'skills' in parsedState
      )

    if (isLegacyState) {
      window.localStorage.setItem('gameData', JSON.stringify(migrateLegacyGameDataState(parsedState)))
    }
  } catch (error) {
    window.localStorage.removeItem('gameData')
  }
}

migrateLegacyGameDataCache()
window.localStorage.setItem(APP_DATA_VERSION_STORAGE_KEY, DATA_VERSION)

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

const gameDataStore = useGameDataStore(pinia)
const calculatorStore = useCalculatorStore(pinia)

void gameDataStore
calculatorStore.rebindToLatestGameData()

app.mount('#app')
