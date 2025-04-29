<template>
    <div class="flex flex-wrap gap-4 justify-center">
      <ModalAnoCompleto v-model="modalAnoAberto" :cores="cores" :escala="props.escala" :data-inicial="props.dataInicial" @navegar-para-mes="navegarParaMes" />
      <ModalConfiguracao v-model="modalConfigAberto" :escala-atual="props.escala" :data-inicial="props.dataInicial" @atualizar-escala="atualizarEscala" @atualizar-data-inicial="(novaData) => emit('atualizar-data-inicial', novaData)" />
      <!-- Botão: Configurar Escala -->
      <button
        @click="abrirModal"
        class="flex items-center gap-2 px-4 py-2 text-white rounded transition bg-primary hover:bg-secondary dark:bg-primary dark:hover:bg-secondary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33
          1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 
          01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65
          1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65
          1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 
          012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 
          01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
        <span>Configurar Escala</span>
      </button>
  
      <!-- Botão: Ano Completo -->
      <button
        @click="abrirAno"
        class="flex items-center gap-2 px-4 py-2 text-white rounded transition bg-primary hover:bg-secondary dark:bg-primary dark:hover:bg-secondary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>Ano Completo</span>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import ModalAnoCompleto from './ModalAnoCompleto.vue'
  import ModalConfiguracao from './ModalConfiguracao.vue'

  const props = defineProps<{
    cores: {
      trabalho: string
      folga: string
    }
    escala: string
    dataInicial: Date
  }>()

  const emit = defineEmits(['atualizar-escala', 'atualizar-data-inicial', 'update:data'])

  const modalAnoAberto = ref(false)
  const modalConfigAberto = ref(false)

  function abrirModal() {
    modalConfigAberto.value = true
  }

  function abrirAno() {
    modalAnoAberto.value = true
  }

  function atualizarEscala(novaEscala: string) {
    emit('atualizar-escala', novaEscala)
  }

  function navegarParaMes(data: Date) {
    emit('update:data', data)
  }
  </script>
  