import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { carregarDados, salvarDados } from '../utils/useDadosApp'

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
    trabalho: '#16a34a',
    folga: '#9ca3af'
  })

  // Getters
  const escalasDisponiveis = computed(() => [...escalasFixas, ...escalasPersonalizadas.value])

  // Funções auxiliares
  function calcularPadraoEscala(escala: string): { diasTrabalho: number; diasFolga: number } {
    const [trabalho, folga] = escala.split('x').map(Number)
    return { diasTrabalho: trabalho, diasFolga: folga }
  }

  function calcularDiasDoMes(data: Date): Date[][] {
    const primeiroDiaDoMes = new Date(data.getFullYear(), data.getMonth(), 1)
    const ultimoDiaDoMes = new Date(data.getFullYear(), data.getMonth() + 1, 0)
    
    const diasDoMes: Date[][] = []
    let semanaAtual: Date[] = []
    
    // Preenche os dias do mês anterior até o primeiro dia do mês atual
    for (let i = 0; i < primeiroDiaDoMes.getDay(); i++) {
      const dia = new Date(primeiroDiaDoMes)
      dia.setDate(dia.getDate() - (primeiroDiaDoMes.getDay() - i))
      semanaAtual.push(dia)
    }
    
    // Preenche os dias do mês atual
    for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
      const dataAtual = new Date(data.getFullYear(), data.getMonth(), dia)
      semanaAtual.push(dataAtual)
      
      if (dataAtual.getDay() === 6) {
        diasDoMes.push(semanaAtual)
        semanaAtual = []
      }
    }
    
    // Preenche os dias do próximo mês até completar a última semana
    if (semanaAtual.length > 0) {
      const ultimoDia = semanaAtual[semanaAtual.length - 1]
      const diasRestantes = 6 - ultimoDia.getDay()
      
      for (let i = 1; i <= diasRestantes; i++) {
        const dia = new Date(ultimoDia)
        dia.setDate(dia.getDate() + i)
        semanaAtual.push(dia)
      }
      
      diasDoMes.push(semanaAtual)
    }
    
    return diasDoMes
  }

  function isDiaTrabalho(data: Date, dataInicialParam: Date, escalaParam: string): boolean {
    if (!dataInicialParam) return false

    const dataAtual = new Date(data.getFullYear(), data.getMonth(), data.getDate())
    dataAtual.setHours(0, 0, 0, 0)
    const dataAtualMS = dataAtual.getTime()
    
    const dataInicialObj = new Date(dataInicialParam)
    dataInicialObj.setHours(0, 0, 0, 0)
    const dataInicialMS = dataInicialObj.getTime()

    const diasDiferenca = Math.floor((dataAtualMS - dataInicialMS) / (1000 * 60 * 60 * 24))
    const { diasTrabalho, diasFolga } = calcularPadraoEscala(escalaParam)
    const ciclo = diasTrabalho + diasFolga

    const posicao = ((diasDiferenca % ciclo) + ciclo) % ciclo
    return posicao < diasTrabalho
  }

  function isDiaFolga(data: Date, dataInicialParam: Date, escalaParam: string): boolean {
    return !isDiaTrabalho(data, dataInicialParam, escalaParam)
  }

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
            trabalho: config.cores.trabalho || '#16a34a',
            folga: config.cores.folga || '#9ca3af'
          }
        }
      }

      // Carregar escalas personalizadas
      const escalasSalvas = localStorage.getItem('escalas_personalizadas')
      if (escalasSalvas) {
        escalasPersonalizadas.value = JSON.parse(escalasSalvas)
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }

  async function salvarConfiguracao(config: ConfiguracaoEscala): Promise<void> {
    try {
      const dados = await carregarDados()
      await salvarDados({ ...dados, escala: JSON.stringify(config) })
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
    }
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

    // Verificar se já existe
    const jaExiste = escalasDisponiveis.value.some(e => e.valor === novaEscalaValor)
    if (jaExiste) return

    // Adicionar à lista de escalas personalizadas
    escalasPersonalizadas.value.push({ valor: novaEscalaValor, nome: novaEscalaNome })

    // Salvar no localStorage
    localStorage.setItem('escalas_personalizadas', JSON.stringify(escalasPersonalizadas.value))
  }

  function removerEscalaPersonalizada(escalaValor: string): void {
    escalasPersonalizadas.value = escalasPersonalizadas.value.filter(e => e.valor !== escalaValor)
    localStorage.setItem('escalas_personalizadas', JSON.stringify(escalasPersonalizadas.value))
  }

  return {
    // Estado
    escalaAtual,
    dataInicial,
    escalasPersonalizadas,
    cores,
    escalasDisponiveis,

    // Funções auxiliares
    calcularPadraoEscala,
    isDiaTrabalho,
    isDiaFolga,
    isTrabalho,
    isFolga,
    calcularDiasDoMes,

    // Actions
    carregarConfiguracao,
    salvarConfiguracao,
    atualizarEscala,
    atualizarDataInicial,
    atualizarCores,
    adicionarEscalaPersonalizada,
    removerEscalaPersonalizada
  }
}) 