<template>
  <div class="flex justify-center gap-8 mt-6">
    <!-- Trabalho -->
    <div class="flex items-center gap-2">
      <label class="w-24 h-10 flex items-center justify-center rounded-lg border dark:border-gray-600 cursor-pointer" :style="{ backgroundColor: corTrabalho }">
        <span class="text-white text-sm">Trabalho</span>
        <input type="color" v-model="corTrabalho" class="opacity-0 w-0 h-0" />
      </label>
    </div>

    <!-- Folga -->
    <div class="flex items-center gap-2">
      <label class="w-24 h-10 flex items-center justify-center rounded-lg border dark:border-gray-600 cursor-pointer" :style="{ backgroundColor: corFolga }">
        <span class="text-white text-sm">Folga</span>
        <input type="color" v-model="corFolga" class="opacity-0 w-0 h-0" />
      </label>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted, watchEffect } from 'vue'
import { getCurrentTheme, isDark } from '../utils/theme'
  
const emit = defineEmits(['atualizar-cores'])
  
// Inicializa com as cores do tema atual
const corTrabalho = ref(getCurrentTheme().trabalho)
const corFolga = ref(getCurrentTheme().folga)
  
onMounted(() => {
  // Prioriza cores salvas pelo usuário
  const corTrabalhoSalva = localStorage.getItem('corTrabalho')
  const corFolgaSalva = localStorage.getItem('corFolga')
  if (corTrabalhoSalva) corTrabalho.value = corTrabalhoSalva
  if (corFolgaSalva) corFolga.value = corFolgaSalva
})

// Atualiza as cores quando o tema mudar
watchEffect(() => {
  // Só atualiza se não houver cores personalizadas salvas
  if (!localStorage.getItem('corTrabalho')) {
    corTrabalho.value = getCurrentTheme().trabalho
  }
  if (!localStorage.getItem('corFolga')) {
    corFolga.value = getCurrentTheme().folga
  }
})
  
  watch([corTrabalho, corFolga], () => {
    localStorage.setItem('corTrabalho', corTrabalho.value)
    localStorage.setItem('corFolga', corFolga.value)
    emit('atualizar-cores', {
      trabalho: corTrabalho.value,
      folga: corFolga.value
    })
  })
  </script>
  