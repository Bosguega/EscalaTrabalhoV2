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