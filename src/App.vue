<template>
  <div class="min-h-screen bg-background text-text font-sans transition-colors duration-300 relative">
    <Cabecalho @toggle-sidebar="toggleMenuLateral" @share="handleShare" />
    <BotoesAcao v-model:data="dataAtual" :cores="scheduleStore.cores" :escala="scheduleStore.escalaAtual" :data-inicial="scheduleStore.dataInicial" @atualizar-escala="scheduleStore.atualizarEscala" @atualizar-data-inicial="scheduleStore.atualizarDataInicial" />
    
    <!-- Área que será capturada -->
    <div ref="areaCapture" class="bg-background py-4 px-2 group">
      <NavegacaoMes v-model:data="dataAtual" />
      <AreaCalendario v-model:data="dataAtual" :cores="scheduleStore.cores" :escala="scheduleStore.escalaAtual" :data-inicial="scheduleStore.dataInicial" />
      <div class="mt-4 pointer-events-none group-[.capturing]:mt-8">
        <LegendaComSeletor :cores="scheduleStore.cores" @atualizar-cores="scheduleStore.atualizarCores" class="group-[.capturing]:!px-0" />
      </div>
      <!-- Logo/Crédito sutil na imagem -->
      <div class="text-center mt-8 opacity-20 text-[10px] uppercase tracking-[0.2em] font-bold pb-4 hidden group-[.capturing]:block">
        Escala de Trabalho
      </div>
    </div>

    <MenuLateral :aberto="menuLateralAberto" @fechar="fecharMenuLateral" />

    <!-- Overlay de Loading durante captura -->
    <div v-if="isCapturing" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-bold tracking-tight">Gerando imagem...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Cabecalho from './components/Cabecalho.vue'
import BotoesAcao from './components/BotoesAcao.vue'
import NavegacaoMes from './components/NavegacaoMes.vue'
import AreaCalendario from './components/AreaCalendario.vue'
import LegendaComSeletor from './components/LegendaComSeletor.vue'
import MenuLateral from './components/MenuLateral.vue'
import { useThemeStore } from './stores/theme'
import { useScheduleStore } from './stores/schedule'
import html2canvas from 'html2canvas'

// Estado
const menuLateralAberto = ref(false)
const dataAtual = ref(new Date())
const areaCapture = ref<HTMLElement | null>(null)
const isCapturing = ref(false)

// Inicializar stores
const themeStore = useThemeStore()
const scheduleStore = useScheduleStore()

onMounted(async () => {
  // Carrega as preferências de tema
  await themeStore.loadThemePreference()
  
  // Carrega as configurações da escala
  await scheduleStore.carregarConfiguracao()
})

// Funções para controlar o menu lateral
function toggleMenuLateral() {
  menuLateralAberto.value = !menuLateralAberto.value
}

function fecharMenuLateral() {
  menuLateralAberto.value = false
}

// Função para capturar e compartilhar
async function handleShare() {
  if (!areaCapture.value) return
  
  try {
    isCapturing.value = true
    
    // Adiciona classe para ajustes específicos de captura (ex: esconder inputs ou mostrar logo)
    areaCapture.value.classList.add('capturing')
    
    // Pequeno delay para garantir que o DOM está pronto e a classe aplicada
    await new Promise(resolve => setTimeout(resolve, 100))

    const canvas = await html2canvas(areaCapture.value, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim() 
        ? `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--color-background')})` 
        : '#0a1220',
      scale: 2, // Melhor qualidade
      logging: false,
      useCORS: true
    })

    areaCapture.value.classList.remove('capturing')

    const image = canvas.toDataURL('image/png')
    
    // Tenta usar a Web Share API se disponível (dispositivos móveis)
    if (navigator.share && navigator.canShare) {
      const blob = await (await fetch(image)).blob()
      const file = new File([blob], `escala-${dataAtual.value.getMonth()+1}-${dataAtual.value.getFullYear()}.png`, { type: 'image/png' })
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Minha Escala de Trabalho',
          text: `Confira minha escala de ${dataAtual.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
        })
      } else {
        downloadImage(image)
      }
    } else {
      downloadImage(image)
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error)
    alert('Não foi possível gerar a imagem.')
  } finally {
    isCapturing.value = false
  }
}

function downloadImage(dataUrl: string) {
  const link = document.createElement('a')
  link.download = `escala-${dataAtual.value.getMonth()+1}-${dataAtual.value.getFullYear()}.png`
  link.href = dataUrl
  link.click()
}
</script>

<style>
/* Tailwind cuida da maior parte do estilo global */
</style>
