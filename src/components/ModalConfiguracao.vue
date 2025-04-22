<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-0 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl transition-all duration-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl sm:text-2xl font-bold dark:text-gray-200">Configurar Escala</h2>
        <button
          @click="$emit('update:modelValue', false)"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Escala -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selecione uma escala</label>
          <div class="relative">
            <select
              v-model="escalaLocal"
              class="w-full border rounded-md py-3 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              @change="mostrarOpcoesCriarRemover = false"
            >
              <option value="" disabled>Selecione uma escala</option>
              <option v-for="escala in escalasDisponiveis" :key="escala.valor" :value="escala.valor">
                {{ escala.nome }}
              </option>
              <option value="nova-escala">+ Criar Nova Escala</option>
              <option v-if="escalasPersonalizadas.length > 0" value="remover-escala">🗑️ Remover Escala</option>
            </select>
          </div>
        </div>
        
        <!-- Formulário para criar nova escala -->
        <div v-if="escalaLocal === 'nova-escala'" class="border p-3 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <h3 class="font-medium mb-2">Criar Nova Escala</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Dias de Trabalho</label>
              <input 
                type="number" 
                v-model="novaEscalaDiasTrabalho" 
                min="1" 
                max="30"
                class="w-full border rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-base"
              >
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Dias de Folga</label>
              <input 
                type="number" 
                v-model="novaEscalaDiasFolga" 
                min="1" 
                max="30"
                class="w-full border rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-base"
              >
            </div>
          </div>
          <div class="flex justify-end">
            <button 
              @click="adicionarNovaEscala" 
              class="px-4 py-2 bg-green-600 text-white text-base rounded hover:bg-green-700 transition min-w-[100px]"
            >
              Adicionar
            </button>
          </div>
        </div>
        
        <!-- Opções para remover escala -->
        <div v-if="escalaLocal === 'remover-escala'" class="border p-3 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <h3 class="font-medium mb-2 dark:text-gray-200">Remover Escala</h3>
          <div class="mb-2">
            <select
              v-model="escalaParaRemover"
              class="w-full border rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-base"
            >
              <option value="" disabled selected>Selecione uma escala para remover</option>
              <option v-for="escala in escalasPersonalizadas" :key="escala.valor" :value="escala.valor">
                {{ escala.nome }}
              </option>
            </select>
          </div>
          <div class="flex justify-end">
            <button 
              @click="removerEscala" 
              :disabled="!escalaParaRemover"
              class="px-4 py-2 bg-red-600 text-white text-base rounded hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800 dark:disabled:bg-gray-600 min-w-[100px]"
            >
              Remover
            </button>
          </div>
        </div>

        <!-- Data inicial -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Primeiro Dia de Trabalho</label>
          <input
            type="date"
            v-model="dataInicialLocal"
            class="w-full border rounded-md py-3 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

<!-- Botões -->
<div class="flex flex-col sm:flex-row justify-between gap-2 mt-6">
  <BaseButton
    texto="Cancelar"
    tipo="secondary"
    fullWidth
    @click="$emit('update:modelValue', false)"
  />
  <BaseButton
    texto="Aplicar"
    tipo="primary"
    fullWidth
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
import { salvarConfiguracao, carregarConfiguracao } from '../utils/escala'

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
