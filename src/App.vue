<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
    <Cabecalho @toggle-sidebar="toggleMenuLateral" />
    <BotoesAcao :cores="cores" :escala="escalaAtual" :data-inicial="dataInicialEscala" @atualizar-escala="atualizarEscala" @atualizar-data-inicial="atualizarDataInicial" />
    <NavegacaoMes v-model:data="dataAtual" />
    <AreaCalendario v-model:data="dataAtual" :cores="cores" :escala="escalaAtual" :data-inicial="dataInicialEscala" />
    <LegendaComSeletor @atualizar-cores="atualizarCores" />
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
import { loadThemePreference, getCurrentTheme } from './utils/theme'
import { carregarConfiguracao, salvarConfiguracao } from './utils/escala'

// Estado do menu lateral
const menuLateralAberto = ref(false)

const dataAtual = ref(new Date())
const escalaAtual = ref('2x2')
const dataInicialEscala = ref(new Date())

const cores = ref({
  trabalho: getCurrentTheme().trabalho,
  folga: getCurrentTheme().folga
})

onMounted(async () => {
  // Carrega as preferências de tema
  loadThemePreference()
  
  // Carrega as configurações da escala usando a função assíncrona
  const configuracao = await carregarConfiguracao()
  escalaAtual.value = configuracao.escala
  dataInicialEscala.value = new Date(configuracao.dataInicial)
  
  // Atualiza as cores com base na configuração
  if (configuracao.cores?.trabalho) {
    cores.value.trabalho = configuracao.cores.trabalho
  }
  
  if (configuracao.cores?.folga) {
    cores.value.folga = configuracao.cores.folga
  }
})

async function atualizarCores(novasCores: { trabalho: string; folga: string }) {
  cores.value = novasCores
  await salvarConfiguracao({
    escala: escalaAtual.value,
    dataInicial: dataInicialEscala.value.toISOString(),
    cores: novasCores
  })
}

async function atualizarEscala(novaEscala: string) {
  escalaAtual.value = novaEscala
  await salvarConfiguracao({
    escala: novaEscala,
    dataInicial: dataInicialEscala.value.toISOString(),
    cores: cores.value
  })
}

async function atualizarDataInicial(novaData: Date) {
  dataInicialEscala.value = novaData
  await salvarConfiguracao({
    escala: escalaAtual.value,
    dataInicial: novaData.toISOString(),
    cores: cores.value
  })
}

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
