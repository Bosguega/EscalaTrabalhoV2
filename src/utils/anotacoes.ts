const STORAGE_KEY = 'anotacoes_calendario';

import { carregarDados, salvarDados } from './useDadosApp';

export function formatarDataChave(data: Date): string {
  if (!data) return '';
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const dia = data.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export async function verificarAnotacao(data: Date): Promise<boolean> {
  const dados = await carregarDados();
  if (!dados.anotacoes) return false;
  const anotacoes = JSON.parse(dados.anotacoes);
  const dataFormatada = formatarDataChave(data);
  return !!anotacoes[dataFormatada] && anotacoes[dataFormatada].trim() !== '';
}

export async function obterTodasAnotacoes(): Promise<Record<string, string>> {
  const dados = await carregarDados();
  return dados.anotacoes ? JSON.parse(dados.anotacoes) : {};
}

// Função para abrir o modal de anotações
export function abrirModalAnotacoes(
  dataSelecionada: { value: Date },
  modalAnotacoesAberto: { value: boolean },
  ano: number,
  mes: number,
  dia: number | string
): void {
  if (dia === '' || dia === null || dia === undefined) return;
  dataSelecionada.value = new Date(ano, mes, Number(dia));
  modalAnotacoesAberto.value = true;
}

// Função para atualizar a visualização após salvar anotações
export function atualizarAnotacoes<T>(diasArray: { value: T[] }): void {
  // Força update do array reativo
  diasArray.value = [...diasArray.value];
}

// Formatar a data para exibição no título
export function formatarData(data: Date): string {
  if (!data) return '';
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Carregar anotação do localStorage
export async function carregarAnotacao(data: Date): Promise<string> {
  const dados = await carregarDados();
  if (dados.anotacoes) {
    const anotacoes = JSON.parse(dados.anotacoes);
    const dataFormatada = formatarDataChave(data);
    return anotacoes[dataFormatada] || '';
  }
  return '';
}

// Salvar anotação no localStorage
export async function salvarAnotacao(
  data: Date,
  texto: string,
  callback?: (data: Date, texto: string) => void
): Promise<void> {
  const dados = await carregarDados();
  const anotacoes = dados.anotacoes ? JSON.parse(dados.anotacoes) : {};
  
  const dataFormatada = formatarDataChave(data);
  anotacoes[dataFormatada] = texto;
  
  await salvarDados({ ...dados, anotacoes: JSON.stringify(anotacoes) });
  if (callback) {
    callback(data, texto);
  }
}