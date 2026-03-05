<template>
  <div v-if="noteStore.modalAberto" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
    <div class="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-text tracking-tight">Anotações <span class="text-primary ml-2">{{ noteStore.formatarData(noteStore.dataSelecionada!) }}</span></h2>
        <button
          @click="fecharModal"
          class="p-2 hover:bg-secondary/50 rounded-xl text-text opacity-50 hover:opacity-100 transition-all focus:outline-none"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-text opacity-40 uppercase tracking-widest mb-2">Sua Anotação</label>
          <textarea
            v-model="anotacaoLocal"
            class="w-full bg-secondary/10 text-text border border-border rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] transition-all resize-none shadow-inner custom-scrollbar"
            placeholder="Digite algo para este dia..."
          ></textarea>
        </div>

        <div class="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            @click="fecharModal"
            class="w-full py-4 text-text font-bold bg-secondary/20 hover:bg-secondary/40 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            Cancelar
          </button>
          <button
            @click="salvarAnotacao"
            class="w-full py-4 text-white font-bold bg-primary rounded-2xl transition-all hover:opacity-90 shadow-lg active:scale-95"
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