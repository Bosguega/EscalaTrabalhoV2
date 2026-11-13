import localforage from 'localforage'
import type { ThemeName } from '../types/theme'
import { criarPersistenciaDados } from './persistenciaDados.js'

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

const persistencia = criarPersistenciaDados(localforage, 'appData', dadosPadrao)

export const carregarDados = persistencia.carregarDados
export const salvarDados = persistencia.salvarDados
export const atualizarDados = persistencia.atualizarDados
export const resetarDados = persistencia.resetarDados
