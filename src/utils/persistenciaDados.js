import { criarFilaSerializada } from './filaSerializada.js'

/**
 * Cria a camada de persistência do app com um armazenamento compatível
 * com getItem/setItem (por exemplo, localForage ou um adapter em memória).
 */
export function criarPersistenciaDados(storage, storageKey, dadosPadrao) {
  const executarNaFila = criarFilaSerializada()

  async function lerDadosPersistidos() {
    const dadosBrutos = await storage.getItem(storageKey)

    if (!dadosBrutos || typeof dadosBrutos !== 'object') {
      return { ...dadosPadrao }
    }

    const dados = dadosBrutos

    switch (dados.versao ?? 1) {
      case 1:
        return {
          versao: 2,
          escala: dados.escala ?? null,
          anotacoes: dados.anotacoes ?? null,
          animacao: dados.animacao ?? null,
          tema: dados.tema ?? null
        }
      case 2:
        return { ...dadosPadrao, ...dados, versao: 2 }
      default:
        return { ...dadosPadrao }
    }
  }

  async function carregarDados() {
    try {
      return await executarNaFila(() => lerDadosPersistidos())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      return { ...dadosPadrao }
    }
  }

  async function salvarDados(dados) {
    return executarNaFila(async () => {
      try {
        await storage.setItem(storageKey, { ...dados, versao: 2 })
      } catch (error) {
        console.error('Erro ao salvar dados:', error)
        throw error
      }
    })
  }

  async function atualizarDados(atualizacao) {
    return executarNaFila(async () => {
      try {
        const dadosAtuais = await lerDadosPersistidos()
        const alteracoes = typeof atualizacao === 'function'
          ? atualizacao({ ...dadosAtuais })
          : atualizacao
        const novosDados = {
          ...dadosAtuais,
          ...alteracoes,
          versao: 2
        }

        await storage.setItem(storageKey, novosDados)
        return novosDados
      } catch (error) {
        console.error('Erro ao atualizar dados:', error)
        throw error
      }
    })
  }

  return {
    carregarDados,
    salvarDados,
    atualizarDados
  }
}
