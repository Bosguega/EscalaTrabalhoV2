<template>
  <Transition name="modal-fade">
    <div v-if="noteStore.modalAberto" class="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl modal-panel">
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
            :disabled="!noteStore.anotacoesCarregadas"
            @input="erroSalvamento = ''"
            class="w-full bg-secondary/10 text-text border border-border rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] transition-all resize-none shadow-inner custom-scrollbar disabled:opacity-50"
            placeholder="Digite algo para este dia..."
          ></textarea>
        </div>

        <p v-if="erroSalvamento" role="alert" class="text-sm text-red-500 font-medium">
          {{ erroSalvamento }}
        </p>

        <div class="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            @click="fecharModal"
            class="w-full py-4 text-text font-bold bg-secondary/20 hover:bg-secondary/40 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            Cancelar
          </button>
          <button
            @click="salvarAnotacao"
            :disabled="!noteStore.anotacoesCarregadas || salvando"
            class="w-full py-4 text-white font-bold bg-primary rounded-2xl transition-all hover:opacity-90 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNoteStore } from '../stores/note'

const noteStore = useNoteStore()
const anotacaoLocal = ref('')
const erroSalvamento = ref('')
const salvando = ref(false)

// Aguarda a leitura inicial antes de preencher o campo editável.
watch(() => noteStore.modalAberto, async (novoValor) => {
  if (novoValor && noteStore.dataSelecionada) {
    const data = noteStore.dataSelecionada
    await noteStore.carregarAnotacoes()

    // Evita preencher o modal se ele foi fechado ou outra data foi selecionada durante a leitura.
    if (!noteStore.modalAberto || noteStore.dataSelecionada !== data) return

    anotacaoLocal.value = noteStore.carregarAnotacao(data)
    erroSalvamento.value = ''
  }
})

function fecharModal() {
  noteStore.fecharModal()
}

async function salvarAnotacao() {
  if (!noteStore.dataSelecionada || !noteStore.anotacoesCarregadas || salvando.value) return

  salvando.value = true
  erroSalvamento.value = ''

  try {
    await noteStore.salvarAnotacao(noteStore.dataSelecionada, anotacaoLocal.value)
    noteStore.fecharModal()
  } catch {
    erroSalvamento.value = 'Não foi possível salvar a anotação. Verifique o armazenamento e tente novamente.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 200ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
  transition: transform 200ms ease, opacity 200ms ease;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
  transform: scale(0.96);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal-fade-enter-active .modal-panel,
  .modal-fade-leave-active .modal-panel {
    transition-duration: 0.01ms;
  }
}
</style>
