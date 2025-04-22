<template>
  <div
    ref="calendario"
    class="w-full max-w-md mx-auto mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4"
  >
    <!-- Cabeçalho dos dias da semana -->
    <div class="grid grid-cols-7 text-center font-semibold text-gray-600 dark:text-gray-300 mb-2">
      <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
    </div>

    <!-- Dias do mês -->
    <div class="grid grid-cols-7 text-center gap-1">
      <div
        v-for="(dia, index) in diasDoMes"
        :key="index"
        class="aspect-square flex items-center justify-center text-sm rounded transition duration-200 relative cursor-pointer"
        :style="{
          backgroundColor: dia.ativo
            ? isTrabalho(ano, mes, dia.numero, props.dataInicial, props.escala)
              ? props.cores.trabalho
              : isFolga(ano, mes, dia.numero, props.dataInicial, props.escala)
                ? props.cores.folga
                : 'transparent'
            : 'transparent',
          color: dia.ativo
            ? (isTrabalho(ano, mes, dia.numero, props.dataInicial, props.escala) || isFolga(ano, mes, dia.numero, props.dataInicial, props.escala)
              ? 'white' : '#4b5563')
            : '#9ca3af'
        }"
        @click="abrirModalAnotacoes(dia)"
      >
        {{ dia.numero }}

        <!-- Indicador de anotação -->
        <div
          v-if="dia.ativo && dia.numero && temAnotacao(ano, mes, dia.numero)"
          class="absolute top-0 right-0 w-0 h-0 border-t-[18px] border-l-[18px] border-t-yellow-400 border-l-transparent shadow-md rounded-tr-sm"
        ></div>
      </div>
    </div>

    <!-- Modal de Anotações -->
    <Anotacoes v-model="modalAnotacoesAberto" :data="dataSelecionada" @anotacao-salva="atualizarAnotacoes" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { isTrabalho, isFolga, gerarDiasDoMes } from '../utils/escala'
import { verificarAnotacao } from '../utils/anotacoes'
import Anotacoes from './Anotacoes.vue'

// Props
const props = defineProps<{
  data: Date
  cores: { trabalho: string; folga: string }
  escala: string
  dataInicial: Date
}>()

// Variáveis auxiliares
const ano = props.data.getFullYear()
const mes = props.data.getMonth()

// Modal de anotação
const modalAnotacoesAberto = ref(false)
const dataSelecionada = ref(new Date())

function abrirModalAnotacoes(dia: { numero: number | string, ativo: boolean }) {
  if (!dia.ativo || !dia.numero) return
  dataSelecionada.value = new Date(ano, mes, Number(dia.numero))
  modalAnotacoesAberto.value = true
}

function atualizarAnotacoes() {
  diasDoMes.value = [...diasDoMes.value] // Força update
}

function temAnotacao(ano: number, mes: number, dia: number): boolean {
  const data = new Date(ano, mes, dia)
  return verificarAnotacao(data)
}

const diasDoMes = ref([])

function atualizarDiasDoMes() {
  const { dias, diasAntes } = gerarDiasDoMes(props.data)
  const diasFormatados = []

  for (let i = 0; i < diasAntes; i++) {
    diasFormatados.push({ numero: '', ativo: false })
  }

  for (const dia of dias) {
    diasFormatados.push({ numero: dia, ativo: true })
  }

  diasDoMes.value = diasFormatados
}

watch(() => props.data, () => {
  atualizarDiasDoMes()
}, { immediate: true })

// Refs e variáveis para swipe
const calendario = ref<HTMLElement | null>(null)
let startX = 0

// Emitir mudança de mês
const emit = defineEmits<{
  (e: 'update:data', value: Date): void
}>()

function anterior() {
  const novaData = new Date(props.data)
  novaData.setMonth(novaData.getMonth() - 1)
  emit('update:data', novaData)
}

function proximo() {
  const novaData = new Date(props.data)
  novaData.setMonth(novaData.getMonth() + 1)
  emit('update:data', novaData)
}

// Swipe logic
onMounted(() => {
  const el = calendario.value
  if (!el) return

  el.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    console.log('TouchStart', startX)
  })

  el.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX
    const deltaX = endX - startX
    console.log('TouchEnd', endX)
    console.log('Swipe deltaX', deltaX)

    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        console.log('← Swipe para direita: mês anterior')
        anterior()
      } else {
        console.log('→ Swipe para esquerda: próximo mês')
        proximo()
      }
    }
  })

  el.addEventListener('touchmove', (e) => {
    e.preventDefault()
  }, { passive: false })
})
</script>
