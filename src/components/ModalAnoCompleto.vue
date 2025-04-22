<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold">Calendário Anual</h2>
          <select 
            v-model="anoSelecionado" 
            class="border rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>
        <button
          @click="$emit('update:modelValue', false)"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="mes in meses" :key="mes.numero" class="border rounded-lg p-4 dark:border-gray-600 dark:text-gray-200">
          <h3 class="text-lg font-semibold mb-2">{{ mes.nome }}</h3>
          <div class="grid grid-cols-7 gap-1 text-center">
            <div
              v-for="dia in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']"
              :key="dia"
              class="text-sm font-medium text-gray-500"
            >
              {{ dia }}
            </div>

            <div
              v-for="(_, i) in mes.diasAntes"
              :key="`empty-before-${i}`"
              class="text-sm p-1"
            ></div>

            <div
              v-for="dia in mes.dias"
              :key="dia"
              class="aspect-square flex items-center justify-center text-sm rounded transition duration-200 relative cursor-pointer"
              :style="{
                backgroundColor: isTrabalho(anoSelecionado, mes.numero, dia, dataInicialObj, props.escala)
                  ? props.cores.trabalho
                  : isFolga(anoSelecionado, mes.numero, dia, dataInicialObj, props.escala)
                    ? props.cores.folga
                    : 'transparent',
                color: isTrabalho(anoSelecionado, mes.numero, dia, dataInicialObj, props.escala) ||
                       isFolga(anoSelecionado, mes.numero, dia, dataInicialObj, props.escala)
                  ? 'white'
                  : '#4b5563'
              }"
              @click="abrirModalAnotacoes(mes.numero, dia)"
            >
              {{ dia }}
              <!-- Indicador de anotação (bandeirinha com sombra) -->
              <div v-if="temAnotacao(anoSelecionado, mes.numero, dia)" 
                   class="absolute top-0 right-0 w-0 h-0 border-t-[18px] border-l-[18px] border-t-yellow-400 border-l-transparent shadow-md rounded-tr-sm"
              ></div>
            </div>

            <div
              v-for="(_, i) in mes.diasDepois"
              :key="`empty-after-${i}`"
              class="text-sm p-1"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Anotações -->
    <Anotacoes v-model="modalAnotacoesAberto" :data="dataSelecionada" @anotacao-salva="atualizarAnotacoes" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { gerarDiasDoMes, isTrabalho, isFolga } from '../utils/escala'
import { verificarAnotacao } from '../utils/anotacoes'
import Anotacoes from './Anotacoes.vue'

const props = defineProps<{
  modelValue: boolean
  cores: {
    trabalho: string
    folga: string
  }
  escala: string
  dataInicial: Date
}>()

defineEmits(['update:modelValue'])

// Estado para o modal de anotações
const modalAnotacoesAberto = ref(false)
const dataSelecionada = ref(new Date())

// Verificar se um dia tem anotação
function temAnotacao(ano: number, mes: number, dia: number): boolean {
  const data = new Date(ano, mes, dia)
  return verificarAnotacao(data)
}

// Abrir modal de anotações ao clicar em um dia
function abrirModalAnotacoes(mes: number, dia: number) {
  dataSelecionada.value = new Date(anoSelecionado.value, mes, dia)
  modalAnotacoesAberto.value = true
}

// Atualizar quando uma anotação for salva
function atualizarAnotacoes() {
  // Forçar atualização do componente
  meses.value = [...meses.value]
}

// Garantir que dataInicial seja um objeto Date válido
const dataInicialObj = computed(() => {
  if (!props.dataInicial) return new Date()
  return new Date(props.dataInicial)
})
const anoAtual = new Date().getFullYear()
const anoSelecionado = ref(anoAtual)

// Gerar lista de anos disponíveis (5 anos para trás e 5 anos para frente)
const anosDisponiveis = computed(() => {
  const anos = []
  for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
    anos.push(i)
  }
  return anos
})

const meses = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const data = new Date(anoSelecionado.value, i, 1)
    const { dias, diasAntes, diasDepois } = gerarDiasDoMes(data)

    return {
      numero: i,
      nome: data.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^./, m => m.toUpperCase()),
      dias,
      diasAntes,
      diasDepois
    }
  })
})
</script>
