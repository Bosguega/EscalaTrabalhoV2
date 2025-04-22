<template>
    <header class="flex items-center justify-between p-4 bg-primary text-white shadow-md dark:bg-gray-800">
      <h1 class="text-lg font-semibold tracking-wide">Escala de Trabalho</h1>
      <div class="flex items-center gap-4">
        <!-- Botão de tema -->
        <button
          @click="toggleTheme"
          class="p-2 rounded focus:outline-none focus:ring-2 focus:ring-white" 
          :style="{ 'background-color': isDark ? 'transparent' : '', '&:hover': { backgroundColor: getCurrentTheme().primary } }"
          aria-label="Alternar tema"
        >
          <!-- Ícone de sol/lua -->
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        <!-- Botão de menu -->
        <button
          @click="toggleSidebar"
          class="p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
          :style="{ 'background-color': isDark ? 'transparent' : '', '&:hover': { backgroundColor: getCurrentTheme().primary } }"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  import { isDark, toggleTheme, getCurrentTheme } from '../utils/theme'

  const emit = defineEmits(['toggle-sidebar'])

  function toggleSidebar() {
    emit('toggle-sidebar')
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se quiser */
  </style>
  