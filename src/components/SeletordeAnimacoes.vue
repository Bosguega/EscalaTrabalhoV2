<template>
  <div class="p-4 border-t border-gray-200 dark:border-gray-700">
    <h3 class="text-md font-medium text-gray-800 dark:text-white mb-3">Animações de Transição</h3>
    
    <div class="space-y-2">
      <div v-for="animation in animations" :key="animation.id" class="flex items-center">
        <input 
          type="radio" 
          :id="`animation-${animation.id}`" 
          :value="animation.id" 
          v-model="selectedAnimationId"
          class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
        >
        <label 
          :for="`animation-${animation.id}`" 
          class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          :title="animation.description"
        >
          {{ animation.name }}
        </label>
      </div>
    </div>
    
    <div class="mt-4">
      <button 
        @click="previewAnimation" 
        class="w-full py-2 px-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600 transition text-sm"
      >
        Visualizar Animação
      </button>
    </div>
    
    <!-- Preview da animação -->
    <div v-if="isPreviewVisible" class="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
      <div 
        :class="previewClass" 
        class="p-2 bg-purple-100 dark:bg-gray-700 rounded text-center text-sm text-purple-700 dark:text-purple-300"
      >
        Exemplo de Animação
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { animations, selectAnimation, selectedAnimation, loadAnimationPreference } from '../utils/animations'

// Estado para controlar a visualização da animação
const isPreviewVisible = ref(false)
const previewClass = ref('')

// ID da animação selecionada
const selectedAnimationId = computed({
  get: () => selectedAnimation.value.id,
  set: (id: string) => selectAnimation(id)
})

// Função para visualizar a animação
function previewAnimation() {
  // Reset da animação
  isPreviewVisible.value = true
  previewClass.value = ''
  
  // Aplicar a animação após um pequeno delay para garantir o reset
  setTimeout(() => {
    const animation = animations.find(a => a.id === selectedAnimationId.value)
    if (animation) {
      previewClass.value = animation.enter
    }
  }, 10)
}

// Carregar preferência de animação ao montar o componente
onMounted(() => {
  loadAnimationPreference()
})
</script>

<style>
/* Importar Animate.css para as animações */
@import 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
</style>