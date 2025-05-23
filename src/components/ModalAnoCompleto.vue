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
          @click="emit('update:modelValue', false)"
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
          <h3 
            class="text-lg font-semibold mb-2 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            @click="navegarParaMes(mes.numero)"
          >{{ mes.nome }}</h3>
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
                backgroundColor: scheduleStore.isDiaTrabalho(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                  ? props.cores.trabalho
                  : scheduleStore.isDiaFolga(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                    ? props.cores.folga
                    : 'transparent',
                color: scheduleStore.isDiaTrabalho(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala) ||
                       scheduleStore.isDiaFolga(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
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
    <Anotacoes />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import { useNoteStore } from '../stores/note'
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

const emit = defineEmits(['update:modelValue', 'navegar-para-mes'])

const scheduleStore = useScheduleStore()
const noteStore = useNoteStore()

// Definir variáveis de ano primeiro
const anoAtual = new Date().getFullYear()
const anoSelecionado = ref(anoAtual)

// Garantir que dataInicial seja um objeto Date válido
const dataInicialObj = computed(() => {
  if (!props.dataInicial) return new Date()
  return new Date(props.dataInicial)
})

// Verificar se um dia tem anotação
function temAnotacao(ano: number, mes: number, dia: number): boolean {
  return noteStore.verificarAnotacao(new Date(ano, mes, dia))
}

// Carregar anotações do ano selecionado
async function carregarAnotacoesAno() {
  await noteStore.carregarAnotacoes()
}

// Abrir modal de anotações ao clicar em um dia
function abrirModalAnotacoes(mes: number, dia: number) {
  const data = new Date(anoSelecionado.value, mes, dia)
  noteStore.abrirModal(data)
}

// Navegar para o mês selecionado no calendário principal
function navegarParaMes(mes: number) {
  const data = new Date(anoSelecionado.value, mes, 1)
  emit('navegar-para-mes', data)
  emit('update:modelValue', false)
}

// Observar mudanças no ano selecionado
watch(() => props.modelValue, async (novoValor) => {
  if (novoValor) {
    await carregarAnotacoesAno()
  }
})

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
    const diasAntes = data.getDay()
    const ultimoDia = new Date(anoSelecionado.value, i + 1, 0)
    const totalDias = ultimoDia.getDate()
    const diasDepois = 42 - (diasAntes + totalDias)
    const dias = Array.from({ length: totalDias }, (_, i) => i + 1)

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
