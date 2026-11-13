import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { carregarDados, atualizarDados } from '../utils/useDadosApp'
import {
  calcularPadraoEscala,
  calcularDiasDoMes,
  isDiaTrabalho,
  isDiaFolga
} from '../utils/calculosEscala'

export interface ConfiguracaoEscala {
  escala: string
  dataInicial: string
  cores?: {
    trabalho?: string
    folga?: string
  }
}

interface EscalaPersonalizada {
  valor: string
  nome: string
}

// Escalas padrão do sistema
const escalasFixas: EscalaPersonalizada[] = [
  { valor: '2x2', nome: '2x2 (2 dias de trabalho, 2 de folga)' }
]

export const useScheduleStore = defineStore('schedule', () => {
  // Estado
  const escalaAtual = ref('2x2')
  const dataInicial = ref(new Date())
  const escalasPersonalizadas = ref<EscalaPersonalizada[]>([])
  const cores = ref({
    trabalho: '#ef4444',
    folga: '#22c55e'
  })

  // Getters
  const escalasDisponiveis = computed(() => [...escalasFixas, ...escalasPersonalizadas.value])

  // Funções de cálculo puras, compartilhadas com os testes automatizados.
  // Mantemos os métodos na store para não alterar a API usada pelos componentes.
  function isTrabalho(ano: number, mes: number, dia: number, dataInicialParam: Date, escalaParam: string): boolean {
    return isDiaTrabalho(new Date(ano, mes, dia), dataInicialParam, escalaParam)
  }

  function isFolga(ano: number, mes: number, dia: number, dataInicialParam: Date, escalaParam: string): boolean {
    return !isTrabalho(ano, mes, dia, dataInicialParam, escalaParam)
  }

  // Actions
  async function carregarConfiguracao(): Promise<void> {
    try {
      const dados = await carregarDados()
      if (dados.escala) {
        const config = JSON.parse(dados.escala)
        escalaAtual.value = config.escala || '2x2'
        dataInicial.value = config.dataInicial ? new Date(config.dataInicial) : new Date()
        if (config.cores) {
          cores.value = {
            trabalho: config.cores.trabalho || '#ef4444',
            folga: config.cores.folga || '#22c55e'
          }
        }
      }

      const escalasSalvas = localStorage.getItem('escalas_personalizadas')
      if (escalasSalvas) {
        escalasPersonalizadas.value = JSON.parse(escalasSalvas)
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }

  async function salvarConfiguracao(config: ConfiguracaoEscala): Promise<void> {
    await atualizarDados({ escala: JSON.stringify(config) })
  }

  async function atualizarEscala(novaEscala: string): Promise<void> {
    escalaAtual.value = novaEscala
    await salvarConfiguracao({
      escala: novaEscala,
      dataInicial: dataInicial.value.toISOString(),
      cores: cores.value
    })
  }

  async function atualizarDataInicial(novaData: Date): Promise<void> {
    dataInicial.value = novaData
    await salvarConfiguracao({
      escala: escalaAtual.value,
      dataInicial: novaData.toISOString(),
      cores: cores.value
    })
  }

  async function atualizarCores(novasCores: { trabalho: string; folga: string }): Promise<void> {
    cores.value = novasCores
    await salvarConfiguracao({
      escala: escalaAtual.value,
      dataInicial: dataInicial.value.toISOString(),
      cores: novasCores
    })
  }

  function adicionarEscalaPersonalizada(diasTrabalho: number, diasFolga: number): void {
    if (diasTrabalho < 1 || diasFolga < 1) return

    const novaEscalaValor = `${diasTrabalho}x${diasFolga}`
    const novaEscalaNome = `${diasTrabalho}x${diasFolga} (${diasTrabalho} dias de trabalho, ${diasFolga} de folga)`

    const jaExiste = escalasDisponiveis.value.some(e => e.valor === novaEscalaValor)
    if (jaExiste) return

    escalasPersonalizadas.value.push({ valor: novaEscalaValor, nome: novaEscalaNome })
    localStorage.setItem('escalas_personalizadas', JSON.stringify(escalasPersonalizadas.value))
  }

  function removerEscalaPersonalizada(escalaValor: string): void {
    escalasPersonalizadas.value = escalasPersonalizadas.value.filter(e => e.valor !== escalaValor)
    localStorage.setItem('escalas_personalizadas', JSON.stringify(escalasPersonalizadas.value))
  }

  return {
    escalaAtual,
    dataInicial,
    escalasPersonalizadas,
    cores,
    escalasDisponiveis,
    calcularPadraoEscala,
    isDiaTrabalho,
    isDiaFolga,
    isTrabalho,
    isFolga,
    calcularDiasDoMes,
    carregarConfiguracao,
    salvarConfiguracao,
    atualizarEscala,
    atualizarDataInicial,
    atualizarCores,
    adicionarEscalaPersonalizada,
    removerEscalaPersonalizada
  }
})
