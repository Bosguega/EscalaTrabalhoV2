<template>
  <div class="p-4 border-t border-border">
    <h3 class="text-md font-medium text-text mb-3">Animações de Transição</h3>
    
    <div class="space-y-2">
      <div v-for="animation in animationStore.animations" :key="animation.id" class="flex items-center">
        <input 
          type="radio" 
          :id="`animation-${animation.id}`" 
          :value="animation.id" 
          :checked="selectedAnimationId === animation.id"
          @change="selectedAnimationId = animation.id"
          class="w-4 h-4 text-secondary bg-background border-border focus:ring-secondary focus:ring-offset-background"
        >
        <label 
          :for="`animation-${animation.id}`" 
          class="ml-2 text-sm font-medium text-text opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
          :title="animation.description"
        >
          {{ animation.name }}
        </label>
      </div>
    </div>
    
    <div class="mt-4">
      <button 
        @click="previewAnimation" 
        class="w-full py-2 px-3 bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition text-sm font-medium"
      >
        Visualizar Animação
      </button>
    </div>
    
    <!-- Preview da animação -->
    <div v-if="isPreviewVisible" class="mt-4 p-3 border border-border rounded-md bg-background/50">
      <div 
        :class="previewClass" 
        class="p-2 bg-secondary/10 rounded text-center text-sm text-secondary font-medium"
      >
        Exemplo de Animação
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnimationStore } from '../stores/animation'

const animationStore = useAnimationStore()

// Estado para controlar a visualização da animação
const isPreviewVisible = ref(false)
const previewClass = ref('')

// ID da animação selecionada
const selectedAnimationId = computed({
  get: () => animationStore.selectedAnimation.id,
  set: (id: string) => animationStore.selectAnimation(id)
})

// Função para visualizar a animação
function previewAnimation() {
  // Reset da animação
  isPreviewVisible.value = true
  previewClass.value = ''
  
  // Aplicar a animação após um pequeno delay para garantir o reset
  setTimeout(() => {
    const animation = animationStore.animations.find(a => a.id === selectedAnimationId.value)
    if (animation) {
      previewClass.value = animation.enter
    }
  }, 10)
}

// Carregar preferência de animação ao montar o componente
onMounted(() => {
  animationStore.loadAnimationPreference()
})
</script>

<style>
/* Importar Animate.css para as animações */
@import 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
</style>