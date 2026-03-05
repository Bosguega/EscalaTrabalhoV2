<template>
  <div
    class="w-full max-w-md mx-auto mt-6 bg-card border border-border rounded-3xl shadow-sm p-4 overflow-hidden relative"
  >
    <!-- Cabeçalho dos dias da semana -->
    <div class="grid grid-cols-7 text-center text-[10px] font-bold text-text opacity-40 uppercase tracking-widest mb-4">
      <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
    </div>

    <!-- Wrapper com os eventos de touch -->
    <div 
      class="w-full relative touch-pan-y"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
      :style="{
        transform: `translateX(${swipeOffset}px) rotateY(${swipeOffset * 0.05}deg)`,
        transitionDuration: isSwiping ? '0ms' : '400ms',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }"
    >
      <!-- Dias do mês -->
      <transition
        :enter-active-class="animationStore.selectedAnimation.enter"
        :leave-active-class="animationStore.selectedAnimation.leave"
        mode="out-in"
      >
        <div
          :key="mes"
          class="grid grid-cols-7 text-center gap-2 w-full"
        >
          <div
            v-for="(dia, index) in diasDoMes"
            :key="`${mes}-${index}`"
            class="aspect-square flex items-center justify-center text-base font-medium rounded-xl relative cursor-pointer border transition-all duration-200"
            :class="[`animate__delay-${Math.min(index % 7, 5)}0ms`]"
            :style="{
              borderColor: dia.ativo
                ? scheduleStore.isDiaTrabalho(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                  ? props.cores.trabalho
                  : scheduleStore.isDiaFolga(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                    ? props.cores.folga
                    : 'rgb(var(--color-border))'
                : 'transparent',
              backgroundColor: dia.ativo
                ? scheduleStore.isDiaTrabalho(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                  ? props.cores.trabalho + '1a'
                  : scheduleStore.isDiaFolga(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                    ? props.cores.folga + '1a'
                    : 'transparent'
                : 'transparent',
              color: dia.ativo
                ? (scheduleStore.isDiaTrabalho(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                  ? props.cores.trabalho
                  : scheduleStore.isDiaFolga(new Date(ano, mes, Number(dia.numero)), props.dataInicial, props.escala)
                    ? props.cores.folga
                    : 'rgb(var(--color-text))')
                : 'rgb(var(--color-text) / 0.2)'
            }"
            @click="abrirModalAnotacoes(dia)"
          >
            {{ dia.numero }}

            <!-- Indicador de anotação -->
            <div
              v-if="dia.ativo && dia.numero && temAnotacao(ano, mes, Number(dia.numero))"
              class="absolute top-0 right-0 w-0 h-0 border-t-[18px] border-l-[18px] border-t-yellow-400 border-l-transparent shadow-md rounded-tr-xl opacity-90"
            ></div>
          </div>
        </div>
      </transition>
    </div>
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

// Variáveis para swipe
let startX = 0
let currentX = 0
const swipeOffset = ref(0)
const isSwiping = ref(false)

function handleTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
  currentX = startX
  isSwiping.value = true
  // Se houver transição em curso das bibliotecas externas, permitimos que ocorra
}

function handleTouchMove(e: TouchEvent) {
  if (!isSwiping.value) return
  currentX = e.touches[0].clientX
  // Limitamos um pouco o deslize para dar aquele efeito "borracha" no final
  const rawOffset = currentX - startX
  swipeOffset.value = Math.sign(rawOffset) * (Math.abs(rawOffset) * 0.85)
}

function handleTouchEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  
  const deltaX = swipeOffset.value
  
  if (Math.abs(deltaX) > 60) {
    if (deltaX > 0) {
      anterior()
    } else {
      proximo()
    }
  }
  
  // O componente resetar de volta ao centro suavemente após a transição
  swipeOffset.value = 0
}

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

onMounted(() => {
  // Carregar preferência de animação
  animationStore.loadAnimationPreference()
})

</script>
