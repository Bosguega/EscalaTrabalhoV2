<template>
  <div
    class="w-full max-w-md mx-auto mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4"
    ref="calendario"
  >
    <!-- Cabeçalho dos dias da semana -->
    <div class="grid grid-cols-7 text-center font-semibold text-gray-600 dark:text-gray-300 mb-2">
      <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
    </div>

    <!-- Dias do mês -->
    <transition
      :enter-active-class="animationStore.selectedAnimation.enter"
      :leave-active-class="animationStore.selectedAnimation.leave"
      mode="out-in"
    >
      <div
        :key="mes"
        class="grid grid-cols-7 text-center gap-1 w-full"
      >
        <div
          v-for="(dia, index) in diasDoMes"
          :key="`${mes}-${index}`"
          class="aspect-square flex items-center justify-center text-sm rounded relative cursor-pointer"
          :class="[`animate__delay-${Math.min(index % 7, 5)}0ms`]"
          :style="{
            backgroundColor: dia.ativo
              ? scheduleStore.isDiaTrabalho(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                ? props.cores.trabalho
                : scheduleStore.isDiaFolga(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                  ? props.cores.folga
                  : 'transparent'
              : 'transparent',
            color: dia.ativo
              ? (scheduleStore.isDiaTrabalho(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala) || 
                 scheduleStore.isDiaFolga(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                ? 'white' : '#4b5563')
              : '#9ca3af'
          }"
          @click="abrirModalAnotacoes(dia)"
        >
          {{ dia.numero }}

          <!-- Indicador de anotação -->
          <div
            v-if="dia.ativo && dia.numero && temAnotacao(ano, mes, Number(dia.numero))"
            class="absolute top-0 right-0 w-0 h-0 border-t-[18px] border-l-[18px] border-t-yellow-400 border-l-transparent shadow-md rounded-tr-sm"
          ></div>
        </div>
      </div>
    </transition>
  </div>

  <!-- Modal de Anotações -->
  <Anotacoes />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAnimationStore } from '../stores/animation'
import Anotacoes from './Anotacoes.vue'
import { useScheduleStore } from '../stores/schedule'
import { useNoteStore } from '../stores/note'

const animationStore = useAnimationStore()
const scheduleStore = useScheduleStore()
const noteStore = useNoteStore()

// Props
const props = defineProps<{
  data: Date
  cores: { trabalho: string; folga: string }
  escala: string
  dataInicial: Date
}>()

// Variáveis auxiliares como computed properties para atualizar automaticamente
const ano = computed(() => props.data.getFullYear())
const mes = computed(() => props.data.getMonth())

// Estado
const diasDoMes = ref<{ numero: number | string; ativo: boolean }[]>([])

function abrirModalAnotacoes(dia: { numero: number | string, ativo: boolean }) {
  if (!dia.ativo || !dia.numero) return
  const data = new Date(ano.value, mes.value, Number(dia.numero))
  noteStore.abrirModal(data)
}

async function atualizarAnotacoes() {
  await noteStore.carregarAnotacoes()
  atualizarDiasDoMes()
}

function temAnotacao(ano: number, mes: number, dia: number): boolean {
  return noteStore.verificarAnotacao(new Date(ano, mes, dia))
}

function atualizarDiasDoMes() {
  const diasDoMesCalculados = scheduleStore.calcularDiasDoMes(props.data)
  const diasFormatados = []

  // Processar cada semana
  for (const semana of diasDoMesCalculados) {
    for (const data of semana) {
      if (data.getMonth() === mes.value) {
        diasFormatados.push({ numero: data.getDate(), ativo: true })
      } else {
        diasFormatados.push({ numero: '', ativo: false })
      }
    }
  }

  diasDoMes.value = diasFormatados
}

watch(() => props.data, async () => {
  atualizarDiasDoMes()
  await noteStore.carregarAnotacoes()
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
  // Carregar preferência de animação
  animationStore.loadAnimationPreference()
  
  const el = calendario.value
  if (!el) return

  el.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
  })

  el.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX
    const deltaX = endX - startX

    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        anterior()
      } else {
        proximo()
      }
    }
  })

  el.addEventListener('touchmove', (e) => {
    e.preventDefault()
  }, { passive: false })
})

// Dias da semana
const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Calcula as semanas do mês
const semanas = computed(() => {
  return scheduleStore.calcularDiasDoMes(props.data)
})

// Retorna a classe CSS para a célula do calendário
function getCelulaClasse(dia: Date): string {
  const ehDiaDeTrabalho = scheduleStore.isDiaTrabalho(
    dia,
    props.dataInicial,
    props.escala
  )

  return ehDiaDeTrabalho
    ? `bg-${scheduleStore.cores.trabalho} hover:bg-${scheduleStore.cores.trabalho}/80`
    : `bg-${scheduleStore.cores.folga} hover:bg-${scheduleStore.cores.folga}/80`
}

// Função para alternar o estado do dia (trabalho/folga)
function toggleDia(dia: Date) {
  // Implementar lógica de toggle se necessário
  console.log('Toggle dia:', dia)
}

</script>
