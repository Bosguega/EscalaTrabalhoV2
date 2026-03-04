<template>
  <div v-if="noteStore.modalAberto" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-card text-text border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Anotações - {{ noteStore.formatarData(noteStore.dataSelecionada!) }}</h2>
        <button
          @click="fecharModal"
          class="p-2 hover:bg-text/10 rounded-full transition-colors font-medium"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Corpo -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 opacity-70">Sua Anotação</label>
          <textarea
            v-model="anotacaoLocal"
            class="w-full bg-background text-text border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] transition-all resize-none"
            placeholder="Digite algo para este dia..."
          ></textarea>
        </div>

        <!-- Botões -->
        <div class="grid grid-cols-2 gap-3 mt-6">
          <button
            @click="fecharModal"
            class="px-4 py-3 text-text bg-text/10 rounded-xl transition-all hover:bg-text/20 font-bold"
          >
            Cancelar
          </button>
          <button
            @click="salvarAnotacao"
            class="px-4 py-3 text-white bg-primary rounded-xl transition-all hover:opacity-90 shadow-md font-bold"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNoteStore } from '../stores/note'

const noteStore = useNoteStore()
const anotacaoLocal = ref('')

// Carregar anotação existente quando o modal abrir
watch(() => noteStore.modalAberto, async (novoValor) => {
  if (novoValor && noteStore.dataSelecionada) {
    anotacaoLocal.value = noteStore.carregarAnotacao(noteStore.dataSelecionada)
  }
})

function fecharModal() {
  noteStore.fecharModal()
}

// Salvar anotação no localStorage
async function salvarAnotacao() {
  if (!noteStore.dataSelecionada) return
  await noteStore.salvarAnotacao(noteStore.dataSelecionada, anotacaoLocal.value)
  noteStore.fecharModal()
}
</script>