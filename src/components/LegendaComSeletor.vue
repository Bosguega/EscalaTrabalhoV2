<template>
  <div class="flex flex-col max-w-md mx-auto mt-8 px-4">
    <h3 class="text-[10px] font-bold text-text opacity-40 uppercase tracking-widest mb-3 group-[.capturing]:hidden">Legenda</h3>
    <div class="flex gap-4">
      <!-- Trabalho -->
      <label class="flex-1 bg-card border border-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer shadow-sm hover:bg-secondary/20 transition-colors">
        <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: corTrabalho }"></div>
        <span class="text-sm font-bold text-text">Trabalho</span>
        <input type="color" :value="corTrabalho" @input="e => corTrabalho = (e.target as HTMLInputElement).value" class="opacity-0 w-0 h-0" />
      </label>

      <!-- Folga -->
      <label class="flex-1 bg-card border border-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer shadow-sm hover:bg-secondary/20 transition-colors">
        <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: corFolga }"></div>
        <span class="text-sm font-bold text-text">Folga</span>
        <input type="color" :value="corFolga" @input="e => corFolga = (e.target as HTMLInputElement).value" class="opacity-0 w-0 h-0" />
      </label>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  cores: { trabalho: string; folga: string }
}>()

const emit = defineEmits(['atualizar-cores'])

// Inicializa com as cores recebidas via props
const corTrabalho = ref(props.cores.trabalho)
const corFolga = ref(props.cores.folga)

// Atualiza as cores locais se as props mudarem (ex: carregou dados do storage)
watch(() => props.cores, (novasCores) => {
  if (novasCores.trabalho) corTrabalho.value = novasCores.trabalho
  if (novasCores.folga) corFolga.value = novasCores.folga
}, { deep: true })

watch([corTrabalho, corFolga], () => {
  emit('atualizar-cores', {
    trabalho: corTrabalho.value,
    folga: corFolga.value
  })
})
</script>
  