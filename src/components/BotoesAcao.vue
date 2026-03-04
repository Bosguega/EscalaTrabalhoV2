<template>
    <div class="flex flex-row gap-3 w-full max-w-md mx-auto px-4 mt-6">
      <ModalAnoCompleto v-model="modalAnoAberto" :cores="cores" :escala="props.escala" :data-inicial="props.dataInicial" @navegar-para-mes="navegarParaMes" />
      <ModalConfiguracao v-model="modalConfigAberto" :escala-atual="props.escala" :data-inicial="props.dataInicial" @atualizar-escala="atualizarEscala" @atualizar-data-inicial="(novaData) => emit('atualizar-data-inicial', novaData)" />
      
      <!-- Botão: Configurar Escala -->
      <button
        @click="abrirModal"
        class="flex-1 flex items-center justify-center gap-2 px-2 py-4 text-white rounded-2xl transition-all bg-primary hover:opacity-90 shadow-lg font-bold text-sm active:scale-[0.98]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Escala</span>
      </button>
  
      <!-- Botão: Ano Completo -->
      <button
        @click="abrirAno"
        class="flex-1 flex items-center justify-center gap-2 px-2 py-4 text-white rounded-2xl transition-all bg-secondary border border-border/50 hover:bg-secondary/80 shadow-md font-bold text-sm active:scale-[0.98]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>Calendário</span>
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
  