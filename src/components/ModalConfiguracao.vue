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
            >
              <option value="" disabled class="bg-card">Selecione uma escala</option>
              <option v-for="escala in scheduleStore.escalasDisponiveis" :key="escala.valor" :value="escala.valor" class="bg-card">
                {{ escala.nome }}
              </option>
              <option value="nova-escala" class="bg-card font-bold text-primary">+ Criar Nova Escala</option>
              <option v-if="scheduleStore.escalasPersonalizadas.length > 0" value="remover-escala" class="bg-card font-bold text-folga">🗑️ Remover Escala</option>
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
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                autocomplete="off"
                :value="novaEscalaDiasTrabalho"
                @keydown="bloquearEntradaNaoInteira"
                @paste="bloquearColagemNaoInteira"
                @input="sanitizarEntrada('trabalho', $event)"
                class="w-full bg-card border border-border rounded-xl py-3 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-text"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-text opacity-40 uppercase mb-1">Folga (Dias)</label>
              <input
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                autocomplete="off"
                :value="novaEscalaDiasFolga"
                @keydown="bloquearEntradaNaoInteira"
                @paste="bloquearColagemNaoInteira"
                @input="sanitizarEntrada('folga', $event)"
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
              <option v-for="escala in scheduleStore.escalasPersonalizadas" :key="escala.valor" :value="escala.valor">
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

    <!-- Modal próprio para informar entradas inválidas -->
    <div
      v-if="mostrarModalErroEscala"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-erro-escala"
    >
      <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 id="titulo-erro-escala" class="mb-3 text-lg font-bold text-text">Entrada inválida</h3>
        <p class="mb-6 text-sm text-text">{{ mensagemErroEscala }}</p>
        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-primary px-6 py-2 font-bold text-white hover:opacity-90"
            @click="fecharModalErroEscala"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watchEffect } from 'vue'
import BaseButton from './BaseButton.vue'
import { useScheduleStore } from '../stores/schedule'

const props = defineProps<{
  modelValue: boolean
  escalaAtual: string
  dataInicial?: Date
}>()

const emit = defineEmits(['update:modelValue', 'atualizar-escala', 'atualizar-data-inicial'])
const scheduleStore = useScheduleStore()

// Estados para o formulário
const escalaLocal = ref(props.escalaAtual)
const dataInicialLocal = ref(
  props.dataInicial
    ? new Date(props.dataInicial).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
)
const novaEscalaDiasTrabalho = ref('1')
const novaEscalaDiasFolga = ref('1')
const ultimoValorValidoTrabalho = ref('1')
const ultimoValorValidoFolga = ref('1')
const mensagemErroEscala = ref('')
const mostrarModalErroEscala = ref(false)
const campoComErro = ref<HTMLInputElement | null>(null)
const escalaParaRemover = ref('')

// Atualizar escala e data inicial sempre que props mudar
watchEffect(() => {
  escalaLocal.value = props.escalaAtual
  dataInicialLocal.value = props.dataInicial
    ? new Date(props.dataInicial).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
})

// Exibir mensagem no modal do próprio aplicativo e lembrar o campo que precisa de correção.
function exibirErroEscala(input?: HTMLInputElement) {
  mensagemErroEscala.value = 'Não são aceitos números decimais. Informe apenas números inteiros positivos para criar sua escala.'
  campoComErro.value = input ?? null
  mostrarModalErroEscala.value = true
}

function fecharModalErroEscala() {
  mostrarModalErroEscala.value = false
  const campo = campoComErro.value
  campoComErro.value = null

  if (campo) {
    nextTick(() => {
      campo.focus()
      campo.select()
    })
  }
}

// Impedir a digitação de caracteres que permitam valores não inteiros.
function bloquearEntradaNaoInteira(event: KeyboardEvent) {
  const teclasDeControle = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ]

  if (teclasDeControle.includes(event.key) || event.ctrlKey || event.metaKey) {
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
    exibirErroEscala(event.currentTarget as HTMLInputElement)
  }
}

// Impedir colagem de valores que não sejam formados apenas por dígitos.
function bloquearColagemNaoInteira(event: ClipboardEvent) {
  const valorColado = event.clipboardData?.getData('text') ?? ''

  if (!/^\d+$/.test(valorColado.trim())) {
    event.preventDefault()
    exibirErroEscala(event.currentTarget as HTMLInputElement)
  }
}

// Fallback para entradas de dispositivos móveis, IME e métodos que não disparem keydown.
function sanitizarEntrada(campo: 'trabalho' | 'folga', event: Event) {
  const input = event.target as HTMLInputElement
  const valor = input.value
  const ultimoValorValido = campo === 'trabalho'
    ? ultimoValorValidoTrabalho.value
    : ultimoValorValidoFolga.value

  if (valor !== '' && (!/^\d+$/.test(valor) || !Number.isSafeInteger(Number(valor)))) {
    input.value = ultimoValorValido
    exibirErroEscala(input)
    return
  }

  if (campo === 'trabalho') {
    novaEscalaDiasTrabalho.value = valor
    ultimoValorValidoTrabalho.value = valor
  } else {
    novaEscalaDiasFolga.value = valor
    ultimoValorValidoFolga.value = valor
  }
}

// Adicionar nova escala personalizada
function adicionarNovaEscala() {
  const trabalho = Number(novaEscalaDiasTrabalho.value)
  const folga = Number(novaEscalaDiasFolga.value)

  if (
    !Number.isSafeInteger(trabalho) ||
    !Number.isSafeInteger(folga) ||
    trabalho < 1 ||
    folga < 1
  ) {
    exibirErroEscala()
    return
  }

  const novaEscalaValor = `${trabalho}x${folga}`
  const jaExiste = scheduleStore.escalasDisponiveis.some(e => e.valor === novaEscalaValor)
  if (jaExiste) {
    escalaLocal.value = novaEscalaValor
    return
  }

  scheduleStore.adicionarEscalaPersonalizada(
    trabalho,
    folga
  )
  escalaLocal.value = novaEscalaValor
}

// Remover escala personalizada
function removerEscala() {
  if (!escalaParaRemover.value) return

  scheduleStore.removerEscalaPersonalizada(escalaParaRemover.value)
  escalaLocal.value = '2x2'
  escalaParaRemover.value = ''
}

// Salvar alterações
function salvarEscala() {
  if (escalaLocal.value === 'nova-escala' || escalaLocal.value === 'remover-escala') {
    escalaLocal.value = props.escalaAtual
    return
  }

  if (!/^[1-9]\d*x[1-9]\d*$/.test(escalaLocal.value)) {
    escalaLocal.value = props.escalaAtual || '2x2'
    return
  }

  const [ano, mes, dia] = dataInicialLocal.value.split('-').map(Number)
  const dataObj = new Date(ano, mes - 1, dia)

  emit('atualizar-escala', escalaLocal.value)
  emit('atualizar-data-inicial', dataObj)

  emit('update:modelValue', false)
}
</script>
