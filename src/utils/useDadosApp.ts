import localforage from 'localforage'

// Tipo principal dos dados do app
export interface DadosApp {
  versao: number
  escala: string | null
  anotacoes: string | null
  animacao: string | null
  tema: string | null
}

// Valores padrão
const dadosPadrao: DadosApp = {
  versao: 2,
  escala: null,
  anotacoes: null,
  animacao: null,
  tema: null
}

// Função de migração (exemplo da v1 para v2)
function migrarV1paraV2(dadosV1: any): DadosApp {
  return {
    versao: 2,
    escala: dadosV1.escala || null,
    anotacoes: dadosV1.anotacoes || null,
    animacao: dadosV1.animacao || null,
    tema: dadosV1.tema || null
  }
}

// Carregar dados do app (com migração)
export async function carregarDados(): Promise<DadosApp> {
  try {
    const dadosBrutos = await localforage.getItem('appData')

    if (!dadosBrutos || typeof dadosBrutos !== 'object') {
      return dadosPadrao
    }

    const versao = (dadosBrutos as any).versao || 1

    switch (versao) {
      case 2:
        return dadosBrutos as DadosApp
      case 1:
        const migrado = migrarV1paraV2(dadosBrutos)
        await salvarDados(migrado)
        return migrado
      default:
        return dadosPadrao
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return dadosPadrao
  }
}

// Salvar dados do app
export async function salvarDados(dados: DadosApp): Promise<void> {
  try {
    await localforage.setItem('appData', dados)
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
  }
}

// Resetar para os valores padrão
export async function resetarDados(): Promise<void> {
  await localforage.setItem('appData', dadosPadrao)
}
