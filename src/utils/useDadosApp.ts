import localforage from 'localforage'
import type { ThemeName } from '../types/theme'
import { criarFilaSerializada } from './filaSerializada.js'

const STORAGE_KEY = 'appData'

// Tipo principal dos dados do app
export interface DadosApp {
  versao: number
  escala: string | null
  anotacoes: string | null
  animacao: string | null
  tema: ThemeName | null
}

// Valores padrão
export const dadosPadrao: DadosApp = {
  versao: 2,
  escala: null,
  anotacoes: null,
  animacao: null,
  tema: null
}

type AtualizacaoDados =
  | Partial<Omit<DadosApp, 'versao'>>
  | ((dadosAtuais: DadosApp) => Partial<Omit<DadosApp, 'versao'>>)

// Todas as operações de escrita passam pela mesma fila. Assim, duas stores
// não conseguem ler a mesma versão antiga e sobrescrever as alterações uma da outra.
const executarNaFila = criarFilaSerializada()

// Lê e normaliza os dados sem iniciar outra operação de escrita.
async function lerDadosPersistidos(): Promise<DadosApp> {
  const dadosBrutos = await localforage.getItem<unknown>(STORAGE_KEY)

  if (!dadosBrutos || typeof dadosBrutos !== 'object') {
    return { ...dadosPadrao }
  }

  const dados = dadosBrutos as Partial<DadosApp> & { versao?: number }

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

// =====================
// Carregar dados
// =====================

export async function carregarDados(): Promise<DadosApp> {
  try {
    // Aguarda gravações já solicitadas antes de fazer a leitura.
    await filaGravacao
    return await lerDadosPersistidos()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return { ...dadosPadrao }
  }
}

// =====================
// Salvar dados
// =====================

export async function salvarDados(dados: DadosApp): Promise<void> {
  return executarNaFila(async () => {
    try {
      await localforage.setItem(STORAGE_KEY, { ...dados, versao: 2 })
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
      throw error
    }
  })
}

// Atualiza somente os campos informados, usando sempre a versão mais recente
// persistida. Também aceita uma função para alterações que dependem do estado atual.
export async function atualizarDados(atualizacao: AtualizacaoDados): Promise<DadosApp> {
  return executarNaFila(async () => {
    try {
      const dadosAtuais = await lerDadosPersistidos()
      const alteracoes = typeof atualizacao === 'function'
        ? atualizacao({ ...dadosAtuais })
        : atualizacao
      const novosDados: DadosApp = {
        ...dadosAtuais,
        ...alteracoes,
        versao: 2
      }

      await localforage.setItem(STORAGE_KEY, novosDados)
      return novosDados
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      throw error
    }
  })
}

// =====================
// Resetar dados
// =====================

export async function resetarDados(): Promise<void> {
  return executarNaFila(async () => {
    await localforage.setItem(STORAGE_KEY, { ...dadosPadrao })
  })
}
