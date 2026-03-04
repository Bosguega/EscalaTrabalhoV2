<template>
    <div>
      <!-- Overlay para fechar o menu ao clicar fora -->
      <div 
        v-if="aberto" 
        class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        @click="emit('fechar')" 
      ></div>
      
      <!-- Menu lateral -->
      <div 
        class="fixed top-0 right-0 h-full w-64 bg-background shadow-lg z-50 transform transition-transform duration-300 ease-in-out border-l border-border"
        :class="aberto ? 'translate-x-0' : 'translate-x-full'" 
      >
        <div class="p-4 border-b border-border flex justify-between items-center">
          <h2 class="text-lg font-semibold text-text">Menu</h2>
          <button 
            @click="emit('fechar')" 
            class="p-2 rounded-full hover:bg-text/10 focus:outline-none transition-colors"
            aria-label="Fechar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-text opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-4 overflow-y-auto h-[calc(100%-65px)]">
          <!-- Conteúdo do menu -->
          <div class="space-y-4">
            <div>
              <!-- Submenu de Temas -->
              <button 
                @click="toggleSubmenu('temas')"
                class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-text/5 focus:outline-none transition-colors"
              >
                <div class="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span class="font-semibold text-text">Temas</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" :class="{'transform rotate-180': submenus.temas}" class="h-5 w-5 text-text opacity-50 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="submenus.temas" class="mt-2 pl-2 grid grid-cols-2 gap-2">
                <button 
                  v-for="theme in availableThemes" 
                  :key="theme.name"
                  @click="themeStore.setTheme(theme.name)"
                  class="flex items-center space-x-2 p-2 rounded-md border text-sm transition-all"
                  :class="themeStore.currentTheme === theme.name 
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                    : 'border-border bg-background text-text opacity-80 hover:opacity-100'"
                >
                  <span :style="{ backgroundColor: theme.color }" class="w-4 h-4 rounded-full border border-black/10"></span>
                  <span>{{ theme.label }}</span>
                </button>
              </div>
            </div>

            <div>
              <!-- Submenu de Animações -->
              <button 
                @click="toggleSubmenu('animacoes')"
                class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-text/5 focus:outline-none transition-colors"
              >
                <div class="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-semibold text-text">Animações</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" :class="{'transform rotate-180': submenus.animacoes}" class="h-5 w-5 text-text opacity-50 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="submenus.animacoes" class="mt-2 pl-4">
                <SeletordeAnimacoes />
              </div>
            </div>

            <div>
              <!-- Submenu de Backup -->
              <button 
                @click="toggleSubmenu('backup')"
                class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-text/5 focus:outline-none transition-colors"
              >
                <div class="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span class="font-semibold text-text">Backup</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" :class="{'transform rotate-180': submenus.backup}" class="h-5 w-5 text-text opacity-50 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="submenus.backup" class="mt-2 pl-4">
                <MenuBackup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import SeletordeAnimacoes from './SeletordeAnimacoes.vue'
import MenuBackup from './MenuBackup.vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const availableThemes = themeStore.availableThemes

// Definir props e emits
defineProps<{ aberto: boolean }>()
const emit = defineEmits(['fechar'])

// Controle dos submenus
const submenus = ref({
  temas: false,
  animacoes: false,
  backup: false
})

function toggleSubmenu(menu: 'temas' | 'animacoes' | 'backup') {
  submenus.value[menu] = !submenus.value[menu]
}
</script>
  