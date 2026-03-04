<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
    <div class="bg-card border border-border rounded-[2rem] p-6 sm:p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold text-text tracking-tight">Calendário Anual</h2>
          <div class="relative">
            <select 
              v-model="anoSelecionado" 
              class="bg-secondary/30 text-text border border-border rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 font-bold"
            >
              <option v-for="ano in anosDisponiveis" :key="ano" :value="ano" class="bg-card">{{ ano }}</option>
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <button
          @click="emit('update:modelValue', false)"
          class="p-2 hover:bg-secondary/50 rounded-xl text-text opacity-50 hover:opacity-100 transition-all focus:outline-none"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="mes in meses" :key="mes.numero" class="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors shadow-sm">
          <h3 
            class="text-lg font-bold mb-4 cursor-pointer hover:text-primary transition-colors text-text tracking-tight"
            @click="navegarParaMes(mes.numero)"
          >{{ mes.nome }}</h3>
          <div class="grid grid-cols-7 gap-1 text-center">
            <div
              v-for="dia in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']"
              :key="dia"
              class="text-[9px] font-bold text-text opacity-30 uppercase tracking-widest mb-2"
            >
              {{ dia }}
            </div>

            <div
              v-for="(_, i) in mes.diasAntes"
              :key="`empty-before-${i}`"
              class="aspect-square"
            ></div>

            <div
              v-for="dia in mes.dias"
              :key="dia"
              class="aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all duration-200 relative cursor-pointer border"
              :style="{
                borderColor: scheduleStore.isDiaTrabalho(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                  ? 'var(--color-trabalho)'
                  : scheduleStore.isDiaFolga(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                    ? 'var(--color-folga)'
                    : 'transparent',
                backgroundColor: scheduleStore.isDiaTrabalho(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                  ? 'rgb(var(--color-trabalho) / 0.15)'
                  : scheduleStore.isDiaFolga(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                    ? 'rgb(var(--color-folga) / 0.15)'
                    : 'transparent',
                color: scheduleStore.isDiaTrabalho(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                  ? 'var(--color-trabalho)'
                  : scheduleStore.isDiaFolga(new Date(anoSelecionado, mes.numero, dia), dataInicialObj, props.escala)
                    ? 'var(--color-folga)'
                    : 'var(--color-text)'
              }"
              @click="abrirModalAnotacoes(mes.numero, dia)"
            >
              {{ dia }}
              <!-- Indicador de anotação (permanece igual) -->
              <div v-if="temAnotacao(anoSelecionado, mes.numero, dia)" 
                   class="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-l-[12px] border-t-yellow-400 border-l-transparent shadow-sm rounded-tr-[2px]"
              ></div>
            </div>

            <div
              v-for="(_, i) in mes.diasDepois"
              :key="`empty-after-${i}`"
              class="aspect-square"
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
