<template>
    <div class="max-w-md mx-auto mt-4 px-4">
      <div class="flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm">
        <!-- Botão anterior -->
        <button
          @click="anterior"
          class="p-2 text-text opacity-50 hover:opacity-100 transition-all rounded-lg hover:bg-secondary/30"
          aria-label="Mês anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
    
        <!-- Texto do mês com animação -->
        <transition
          :enter-active-class="animationStore.selectedAnimation.enter"
          :leave-active-class="animationStore.selectedAnimation.leave"
          mode="out-in"
        >
          <span 
            :key="`${nomeMes}-${ano}`" 
            class="text-xl font-bold text-text tracking-tight"
          >
            {{ nomeMes }} {{ ano }}
          </span>
        </transition>
    
        <!-- Botão próximo -->
        <button
          @click="proximo"
          class="p-2 text-text opacity-50 hover:opacity-100 transition-all rounded-lg hover:bg-secondary/30"
          aria-label="Próximo mês"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useAnimationStore } from '../stores/animation'
  
  const animationStore = useAnimationStore()
  
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
  
  // Carregar preferência de animação ao montar o componente
  onMounted(() => {
    animationStore.loadAnimationPreference()
  })
  </script>
  