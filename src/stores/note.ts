import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { carregarDados, salvarDados } from '../utils/useDadosApp'

export const useNoteStore = defineStore('note', () => {
  // Estado
  const anotacoes = ref<Record<string, string>>({})
  const modalAberto = ref(false)
  const dataSelecionada = ref<Date | null>(null)

  // Inicialização
  carregarAnotacoes()

  // Funções auxiliares
  function formatarDataChave(data: Date): string {
    if (!data) return ''
    const ano = data.getFullYear()
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const dia = data.getDate().toString().padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  function formatarData(data: Date): string {
    if (!data) return ''
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Actions
  async function carregarAnotacoes(): Promise<void> {
    try {
      const dados = await carregarDados()
      if (dados.anotacoes) {
        anotacoes.value = JSON.parse(dados.anotacoes)
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error)
    }
  }

  async function salvarAnotacao(data: Date, texto: string): Promise<void> {
    try {
      const dataFormatada = formatarDataChave(data)
      anotacoes.value[dataFormatada] = texto

      const dados = await carregarDados()
      await salvarDados({ 
        ...dados, 
        anotacoes: JSON.stringify(anotacoes.value) 
      })
    } catch (error) {
      console.error('Erro ao salvar anotação:', error)
    }
  }

  function verificarAnotacao(data: Date): boolean {
    const dataFormatada = formatarDataChave(data)
    return !!anotacoes.value[dataFormatada] && 
           anotacoes.value[dataFormatada].trim() !== ''
  }

  function carregarAnotacao(data: Date): string {
    const dataFormatada = formatarDataChave(data)
    return anotacoes.value[dataFormatada] || ''
  }

  function abrirModal(data: Date): void {
    dataSelecionada.value = data
    modalAberto.value = true
  }

  function fecharModal(): void {
    modalAberto.value = false
    dataSelecionada.value = null
  }

  return {
    // Estado
    anotacoes,
    modalAberto,
    dataSelecionada,

    // Getters/Computed
    formatarData,
    verificarAnotacao,

    // Actions
    carregarAnotacoes,
    salvarAnotacao,
    carregarAnotacao,
    abrirModal,
    fecharModal,
    formatarDataChave
  }
}) 