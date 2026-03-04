<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
    <div class="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-text tracking-tight">Configurar Escala</h2>
        <button
          @click="$emit('update:modelValue', false)"
          class="p-2 hover:bg-secondary/50 rounded-xl text-text opacity-50 hover:opacity-100 transition-all focus:outline-none"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <!-- Escala -->
        <div>
          <label class="block text-xs font-bold text-text opacity-40 uppercase tracking-widest mb-2">Selecione uma escala</label>
          <div class="relative">
            <select
              v-model="escalaLocal"
              class="w-full bg-secondary/30 text-text border border-border rounded-2xl py-4 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
              @change="mostrarOpcoesCriarRemover = false"
            >
              <option value="" disabled class="bg-card">Selecione uma escala</option>
              <option v-for="escala in escalasDisponiveis" :key="escala.valor" :value="escala.valor" class="bg-card">
                {{ escala.nome }}
              </option>
              <option value="nova-escala" class="bg-card font-bold text-primary">+ Criar Nova Escala</option>
              <option v-if="escalasPersonalizadas.length > 0" value="remover-escala" class="bg-card font-bold text-folga">🗑️ Remover Escala</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Formulário para criar nova escala -->
        <div v-if="escalaLocal === 'nova-escala'" class="border border-primary/30 p-4 rounded-2xl bg-primary/5 space-y-4">
          <h3 class="font-bold text-primary">Criar Nova Escala</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-text opacity-40 uppercase mb-1">Trabalho (Dias)</label>
              <input 
                type="number" 
                v-model="novaEscalaDiasTrabalho" 
                min="1" 
                max="30"
                class="w-full bg-card border border-border rounded-xl py-3 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-text"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-text opacity-40 uppercase mb-1">Folga (Dias)</label>
              <input 
                type="number" 
                v-model="novaEscalaDiasFolga" 
                min="1" 
                max="30"
                class="w-full bg-card border border-border rounded-xl py-3 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-text"
              >
            </div>
          </div>
          <div class="flex justify-end">
            <button 
              @click="adicionarNovaEscala" 
              class="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              Adicionar
            </button>
          </div>
        </div>
        
        <!-- Opções para remover escala -->
        <div v-if="escalaLocal === 'remover-escala'" class="border border-folga/30 p-4 rounded-2xl bg-folga/5 space-y-4">
          <h3 class="font-bold text-folga">Remover Escala</h3>
          <div class="mb-2">
            <select
              v-model="escalaParaRemover"
              class="w-full bg-card border border-border rounded-xl py-3 px-3 focus:outline-none focus:ring-2 focus:ring-folga text-text"
            >
              <option value="" disabled selected>Selecione uma escala</option>
              <option v-for="escala in escalasPersonalizadas" :key="escala.valor" :value="escala.valor">
                {{ escala.nome }}
              </option>
            </select>
          </div>
          <div class="flex justify-end">
            <button 
              @click="removerEscala" 
              :disabled="!escalaParaRemover"
              class="px-6 py-2 bg-folga text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg active:scale-95"
            >
              Remover
            </button>
          </div>
        </div>

        <!-- Data inicial -->
        <div>
          <label class="block text-xs font-bold text-text opacity-40 uppercase tracking-widest mb-2">Primeiro Dia de Trabalho</label>
          <input
            type="date"
            v-model="dataInicialLocal"
            class="w-full bg-secondary/30 border border-border rounded-2xl py-4 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
        </div>

        <!-- Botões -->
        <div class="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <BaseButton
            texto="Cancelar"
            tipo="secondary"
            fullWidth
            class="!rounded-2xl !py-4"
            @click="$emit('update:modelValue', false)"
          />
          <BaseButton
            texto="Aplicar"
            tipo="primary"
            fullWidth
            class="!rounded-2xl !py-4 shadow-lg"
            :disabled="escalaLocal === 'nova-escala' || escalaLocal === 'remover-escala'"
            @click="salvarEscala"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import { salvarConfiguracao } from '../utils/escala'

const props = defineProps<{
  modelValue: boolean
  escalaAtual: string
  dataInicial?: Date
}>()

const emit = defineEmits(['update:modelValue', 'atualizar-escala', 'atualizar-data-inicial'])

// Escalas padrão do sistema
const escalasFixas = [
  { valor: '2x2', nome: '2x2 (2 dias de trabalho, 2 de folga)' },

]

// Estado para escalas personalizadas
const escalasPersonalizadas = ref<Array<{valor: string, nome: string}>>([])

// Estado para todas as escalas disponíveis (fixas + personalizadas)
const escalasDisponiveis = ref<Array<{valor: string, nome: string}>>([])

// Estados para o formulário
const escalaLocal = ref(props.escalaAtual)
const dataInicialLocal = ref(
  props.dataInicial
    ? new Date(props.dataInicial).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
)
const mostrarOpcoesCriarRemover = ref(false)
const novaEscalaDiasTrabalho = ref(1)
const novaEscalaDiasFolga = ref(1)
const escalaParaRemover = ref('')

// Carregar escalas personalizadas do localStorage
onMounted(() => {
  carregarEscalasPersonalizadas()
  atualizarEscalasDisponiveis()
})

// Atualizar escala e data inicial sempre que props mudar
watchEffect(() => {
  escalaLocal.value = props.escalaAtual
  dataInicialLocal.value = props.dataInicial
    ? new Date(props.dataInicial).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
})

// Carregar escalas personalizadas do localStorage
function carregarEscalasPersonalizadas() {
  const escalasSalvas = localStorage.getItem('escalas_personalizadas')
  if (escalasSalvas) {
    escalasPersonalizadas.value = JSON.parse(escalasSalvas)
  }
}

// Atualizar a lista de escalas disponíveis
function atualizarEscalasDisponiveis() {
  escalasDisponiveis.value = [...escalasFixas, ...escalasPersonalizadas.value]
}

// Adicionar nova escala personalizada
function adicionarNovaEscala() {
  if (novaEscalaDiasTrabalho.value < 1 || novaEscalaDiasFolga.value < 1) {
    return
  }
  
  const novaEscalaValor = `${novaEscalaDiasTrabalho.value}x${novaEscalaDiasFolga.value}`
  const novaEscalaNome = `${novaEscalaDiasTrabalho.value}x${novaEscalaDiasFolga.value} (${novaEscalaDiasTrabalho.value} dias de trabalho, ${novaEscalaDiasFolga.value} de folga)`
  
  // Verificar se já existe
  const jaExiste = escalasDisponiveis.value.some(e => e.valor === novaEscalaValor)
  if (jaExiste) {
    return
  }
  
  // Adicionar à lista de escalas personalizadas
  escalasPersonalizadas.value.push({ valor: novaEscalaValor, nome: novaEscalaNome })
  
  // Salvar no localStorage
  localStorage.setItem('escalas_personalizadas', JSON.stringify(escalasPersonalizadas.value))
  
  // Atualizar lista de escalas disponíveis
  atualizarEscalasDisponiveis()
  
  // Selecionar a nova escala
  escalaLocal.value = novaEscalaValor
}

// Remover escala personalizada
function removerEscala() {
  if (!escalaParaRemover.value) return
  
  // Filtrar a escala selecionada
  escalasPersonalizadas.value = escalasPersonalizadas.value.filter(
    e => e.valor !== escalaParaRemover.value
  )
  
  // Salvar no localStorage
  localStorage.setItem('escalas_personalizadas', JSON.stringify(escalasPersonalizadas.value))
  
  // Atualizar lista de escalas disponíveis
  atualizarEscalasDisponiveis()
  
  // Resetar seleção e voltar para a primeira escala fixa
  escalaLocal.value = escalasFixas[0].valor
  escalaParaRemover.value = ''
}

// Salvar alterações
function salvarEscala() {
  // Se estiver no modo de criar ou remover, voltar para a seleção normal
  if (escalaLocal.value === 'nova-escala' || escalaLocal.value === 'remover-escala') {
    escalaLocal.value = props.escalaAtual
    return
  }
  
  const [ano, mes, dia] = dataInicialLocal.value.split('-').map(Number)
  const dataObj = new Date(ano, mes - 1, dia)

  emit('atualizar-escala', escalaLocal.value)
  emit('atualizar-data-inicial', dataObj)

  // Salvar no localStorage
  salvarConfiguracao({
    escala: escalaLocal.value,
    dataInicial: dataObj.toISOString(),
    cores: {
      trabalho: localStorage.getItem('corTrabalho') || undefined,
      folga: localStorage.getItem('corFolga') || undefined
    }
  })

  emit('update:modelValue', false)
}
</script>
