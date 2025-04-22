<template>
    <div class="flex items-center justify-between max-w-md mx-auto mt-4">
      <!-- Botão anterior -->
      <button
        @click="anterior"
        class="p-2 bg-purple-300 dark:bg-gray-700 rounded hover:bg-purple-400 dark:hover:bg-gray-600 transition text-white dark:text-gray-200"
        aria-label="Mês anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
  
      <!-- Texto do mês -->
      <span class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ nomeMes }} {{ ano }}</span>
  
      <!-- Botão próximo -->
      <button
        @click="proximo"
        class="p-2 bg-purple-300 dark:bg-gray-700 rounded hover:bg-purple-400 dark:hover:bg-gray-600 transition text-white dark:text-gray-200"
        aria-label="Próximo mês"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{ data: Date }>()
  const emit = defineEmits<{
    (e: 'update:data', value: Date): void
  }>()
  
  const nomeMes = computed(() =>
    props.data.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^./, m => m.toUpperCase())
  )
  const ano = computed(() => props.data.getFullYear())
  
  function anterior() {
    const novaData = new Date(props.data)
    novaData.setMonth(novaData.getMonth() - 1)
    emit('update:data', novaData)
  }
  
  function proximo() {
    const novaData = new Date(props.data)
    novaData.setMonth(novaData.getMonth() + 1)
    emit('update:data', novaData)
  }
  </script>
  