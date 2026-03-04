import localforage from 'localforage'
import type { ThemeName } from '../types/theme'

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

// =====================
// Migrações
// =====================

function migrarV1paraV2(dadosV1: any): DadosApp {
  return {
    versao: 2,
    escala: dadosV1.escala ?? null,
    anotacoes: dadosV1.anotacoes ?? null,
    animacao: dadosV1.animacao ?? null,
    tema: dadosV1.tema ?? null
  }
}

// =====================
// Carregar dados
// =====================

export async function carregarDados(): Promise<DadosApp> {
  try {
    const dadosBrutos = await localforage.getItem(STORAGE_KEY)

    if (!dadosBrutos || typeof dadosBrutos !== 'object') {
      return { ...dadosPadrao }
    }

    const versao = (dadosBrutos as any).versao ?? 1

    switch (versao) {
      case 2:
        // Merge garante compatibilidade futura
        return { ...dadosPadrao, ...(dadosBrutos as DadosApp) }

      case 1:
        const migrado = migrarV1paraV2(dadosBrutos)
        await salvarDados(migrado)
        return migrado

      default:
        return { ...dadosPadrao }
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return { ...dadosPadrao }
  }
}

// =====================
// Salvar dados
// =====================

export async function salvarDados(dados: DadosApp): Promise<void> {
  try {
    await localforage.setItem(STORAGE_KEY, { ...dados })
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
  }
}

// =====================
// Resetar dados
// =====================

export async function resetarDados(): Promise<void> {
  await localforage.setItem(STORAGE_KEY, { ...dadosPadrao })
}