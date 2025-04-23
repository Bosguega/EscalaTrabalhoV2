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
import { carregarConfiguracao } from './utils/escala'

// Estado do menu lateral
const menuLateralAberto = ref(false)

const dataAtual = ref(new Date())
const escalaAtual = ref('2x2')
const dataInicialEscala = ref(new Date())

const cores = ref({
  trabalho: getCurrentTheme().trabalho,
  folga: getCurrentTheme().folga
})

onMounted(() => {
  // Carrega as preferências de tema
  loadThemePreference()
  
  // Carrega as configurações da escala do localStorage
  const configuracao = carregarConfiguracao()
  escalaAtual.value = configuracao.escala
  dataInicialEscala.value = new Date(configuracao.dataInicial)
  
  // Prioridade de carregamento das cores:
  // 1. Cores individuais no localStorage (corTrabalho, corFolga)
  // 2. Cores do objeto de configuração
  // 3. Cores do tema atual
  const corTrabalhoSalva = localStorage.getItem('corTrabalho')
  const corFolgaSalva = localStorage.getItem('corFolga')
  
  if (corTrabalhoSalva) {
    cores.value.trabalho = corTrabalhoSalva
  } else if (configuracao.cores?.trabalho) {
    cores.value.trabalho = configuracao.cores.trabalho
  }
  
  if (corFolgaSalva) {
    cores.value.folga = corFolgaSalva
  } else if (configuracao.cores?.folga) {
    cores.value.folga = configuracao.cores.folga
  }
})

function atualizarCores(novasCores: { trabalho: string; folga: string }) {
  cores.value = novasCores
}

function atualizarEscala(novaEscala: string) {
  escalaAtual.value = novaEscala
}

function atualizarDataInicial(novaData: Date) {
  dataInicialEscala.value = novaData
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
