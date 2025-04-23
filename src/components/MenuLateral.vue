<template>
    <div>
      <!-- Overlay para fechar o menu ao clicar fora -->
      <div 
        v-if="aberto" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        @click="emit('fechar')" 
      ></div>
      
      <!-- Menu lateral -->
      <div 
        class="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out"
        :class="aberto ? 'translate-x-0' : 'translate-x-full'" 
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Menu</h2>
          <button 
            @click="emit('fechar')" 
            class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Fechar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-4">
          <!-- Conteúdo do menu com seletor de animações -->
          <div class="space-y-4">
            <div>
              <!-- Submenu de Animações -->
              <button 
                @click="toggleSubmenu('animacoes')"
                class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span class="font-semibold text-gray-800 dark:text-white">Seleção de Animações</span>
                <svg xmlns="http://www.w3.org/2000/svg" :class="{'transform rotate-180': submenus.animacoes}" class="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span class="font-semibold text-gray-800 dark:text-white">Backup</span>
                <svg xmlns="http://www.w3.org/2000/svg" :class="{'transform rotate-180': submenus.backup}" class="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

// Definir props e emits
defineProps<{ aberto: boolean }>()
const emit = defineEmits(['fechar'])

// Controle dos submenus
const submenus = ref({
  animacoes: false,
  backup: false
})

function toggleSubmenu(menu: 'animacoes' | 'backup') {
  submenus.value[menu] = !submenus.value[menu]
}
</script>
  