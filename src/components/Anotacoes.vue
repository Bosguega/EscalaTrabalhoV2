<template>
  <div v-if="noteStore.modalAberto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="rounded-lg p-6 max-w-md w-full" :class="isDark ? 'dark:bg-gray-800 dark:text-gray-200' : 'bg-white text-gray-800'">
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Anotações - {{ noteStore.formatarData(noteStore.dataSelecionada!) }}</h2>
        <button
          @click="fecharModal"
          class="p-2 hover:bg-opacity-20 rounded-full"
          :class="isDark ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100'"
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
          <label class="block text-sm font-medium mb-1">Anotação</label>
          <textarea
            v-model="anotacaoLocal"
            class="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 min-h-[120px]"
            :class="isDark ? 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
            placeholder="Digite sua anotação para este dia..."
          ></textarea>
        </div>

        <!-- Botões -->
        <div class="flex justify-between gap-2 mt-6">
          <button
            @click="fecharModal"
            class="px-4 py-2 text-white rounded transition w-full bg-blue-500 hover:bg-purple-500"
          >
            Cancelar
          </button>
          <button
            @click="salvarAnotacao"
            class="px-4 py-2 text-white rounded transition w-full bg-blue-500 hover:bg-purple-500"
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
import { isDark } from '../utils/theme'
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