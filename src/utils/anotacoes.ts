const STORAGE_KEY = 'anotacoes_calendario';

export function formatarDataChave(data: Date): string {
  if (!data) return '';
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const dia = data.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function verificarAnotacao(data: Date): boolean {
  const anotacoesSalvas = localStorage.getItem(STORAGE_KEY);
  if (!anotacoesSalvas) return false;
  const anotacoes = JSON.parse(anotacoesSalvas);
  const dataFormatada = formatarDataChave(data);
  return !!anotacoes[dataFormatada];
}

export function obterTodasAnotacoes(): Record<string, string> {
  const anotacoesSalvas = localStorage.getItem(STORAGE_KEY);
  return anotacoesSalvas ? JSON.parse(anotacoesSalvas) : {};
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
export function carregarAnotacao(data: Date): string {
  const anotacoesSalvas = localStorage.getItem(STORAGE_KEY);
  if (anotacoesSalvas) {
    const anotacoes = JSON.parse(anotacoesSalvas);
    const dataFormatada = formatarDataChave(data);
    return anotacoes[dataFormatada] || '';
  }
  return '';
}

// Salvar anotação no localStorage
export function salvarAnotacao(
  data: Date,
  texto: string,
  callback?: (data: Date, texto: string) => void
): void {
  const anotacoesSalvas = localStorage.getItem(STORAGE_KEY);
  const anotacoes = anotacoesSalvas ? JSON.parse(anotacoesSalvas) : {};
  
  const dataFormatada = formatarDataChave(data);
  anotacoes[dataFormatada] = texto;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anotacoes));
  if (callback) {
    callback(data, texto);
  }
}