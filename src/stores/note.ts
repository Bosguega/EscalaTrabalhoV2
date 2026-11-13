import { defineStore } from 'pinia'
import { ref } from 'vue'
import { carregarDados, atualizarDados } from '../utils/useDadosApp'

export const useNoteStore = defineStore('note', () => {
  const anotacoes = ref<Record<string, string>>({})
  const modalAberto = ref(false)
  const dataSelecionada = ref<Date | null>(null)

  // Inicialização
  carregarAnotacoes()

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
      const dadosAtualizados = await atualizarDados(dadosAtuais => {
        let anotacoesAtuais: Record<string, string> = {}
        if (dadosAtuais.anotacoes) {
          try {
            anotacoesAtuais = JSON.parse(dadosAtuais.anotacoes)
          } catch {
            anotacoesAtuais = {}
          }
        }

        return {
          anotacoes: JSON.stringify({
            ...anotacoesAtuais,
            [dataFormatada]: texto
          })
        }
      })

      anotacoes.value = dadosAtualizados.anotacoes
        ? JSON.parse(dadosAtualizados.anotacoes)
        : {}
    } catch (error) {
      console.error('Erro ao salvar anotação:', error)
      throw error
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
    anotacoes,
    modalAberto,
    dataSelecionada,
    formatarData,
    verificarAnotacao,
    carregarAnotacoes,
    salvarAnotacao,
    carregarAnotacao,
    abrirModal,
    fecharModal,
    formatarDataChave
  }
})
