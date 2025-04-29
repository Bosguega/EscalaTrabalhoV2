<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
    <Cabecalho @toggle-sidebar="toggleMenuLateral" />
    <BotoesAcao v-model:data="dataAtual" :cores="scheduleStore.cores" :escala="scheduleStore.escalaAtual" :data-inicial="scheduleStore.dataInicial" @atualizar-escala="scheduleStore.atualizarEscala" @atualizar-data-inicial="scheduleStore.atualizarDataInicial" />
    <NavegacaoMes v-model:data="dataAtual" />
    <AreaCalendario v-model:data="dataAtual" :cores="scheduleStore.cores" :escala="scheduleStore.escalaAtual" :data-inicial="scheduleStore.dataInicial" />
    <LegendaComSeletor @atualizar-cores="scheduleStore.atualizarCores" />
    <MenuLateral :aberto="menuLateralAberto" @fechar="fecharMenuLateral" />
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
import { loadThemePreference } from './utils/theme'
import { useScheduleStore } from './stores/schedule'

// Estado do menu lateral
const menuLateralAberto = ref(false)
const dataAtual = ref(new Date())

// Inicializar stores
const scheduleStore = useScheduleStore()

onMounted(async () => {
  // Carrega as preferências de tema
  loadThemePreference()
  
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
</script>

<style>
/* Tailwind cuida da maior parte do estilo global */
</style>
