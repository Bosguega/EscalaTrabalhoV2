<template>
    <header class="flex items-center justify-between p-4 mb-4 bg-background text-text border-b border-border shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2">
        <!-- Ícone Gear -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h1 class="text-lg font-bold tracking-wide">Escala de Trabalho</h1>
      </div>
      <div class="flex items-center gap-2">
        <!-- Botão de Compartilhar -->
        <button
          @click="emitShare"
          class="p-2 rounded-lg bg-secondary/30 text-text hover:bg-secondary/50 focus:outline-none transition-colors border border-border/30"
          aria-label="Compartilhar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <!-- Botão de menu -->
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg bg-secondary/50 text-text hover:bg-secondary focus:outline-none transition-colors"
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
const emit = defineEmits(['toggle-sidebar', 'share'])

function toggleSidebar() {
  emit('toggle-sidebar')
}

function emitShare() {
  emit('share')
}
</script>
  
  <style scoped>
  /* Estilos adicionais se quiser */
  </style>
  