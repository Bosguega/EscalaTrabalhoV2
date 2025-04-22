export interface ConfiguracaoEscala {
    escala: string;
    dataInicial: string;
    cores?: {
      trabalho?: string;
      folga?: string;
    };
  }
  
  const STORAGE_KEY = 'configuracao_escala';
  
  export function salvarConfiguracao(config: ConfiguracaoEscala): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  
  export function carregarConfiguracao(): ConfiguracaoEscala {
    const config = localStorage.getItem(STORAGE_KEY);
    const parsed = config ? JSON.parse(config) : {};
  
    return {
      escala: parsed.escala || '2x2',
      dataInicial: parsed.dataInicial || new Date().toISOString(),
      cores: {
        trabalho: parsed.cores?.trabalho || '#16a34a',
        folga: parsed.cores?.folga || '#9ca3af'
      }
    };
  }
  
  export function calcularPadraoEscala(escala: string): { diasTrabalho: number; diasFolga: number } {
    const [trabalho, folga] = escala.split('x').map(Number);
    return { diasTrabalho: trabalho, diasFolga: folga };
  }
  
  export function isDiaTrabalho(data: Date, dataInicial: Date, escala: string): boolean {
    if (!dataInicial) return false;
  
    const dataAtual = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    dataAtual.setHours(0, 0, 0, 0);
    const dataAtualMS = dataAtual.getTime();
    
    const dataInicialObj = new Date(dataInicial);
    dataInicialObj.setHours(0, 0, 0, 0);
    const dataInicialMS = dataInicialObj.getTime();
  
    const diasDiferenca = Math.floor((dataAtualMS - dataInicialMS) / (1000 * 60 * 60 * 24));
    const { diasTrabalho, diasFolga } = calcularPadraoEscala(escala);
    const ciclo = diasTrabalho + diasFolga;
  
    const posicao = ((diasDiferenca % ciclo) + ciclo) % ciclo;
    return posicao < diasTrabalho;
  }
  
  export function isDiaFolga(data: Date, dataInicial: Date, escala: string): boolean {
    return !isDiaTrabalho(data, dataInicial, escala);
  }
  
  export function isTrabalho(ano: number, mes: number, dia: number, dataInicial: Date, escala: string): boolean {
    return isDiaTrabalho(new Date(ano, mes, dia), dataInicial, escala);
  }
  
  export function isFolga(ano: number, mes: number, dia: number, dataInicial: Date, escala: string): boolean {
    return !isTrabalho(ano, mes, dia, dataInicial, escala);
  }
  
  export function gerarDiasDoMes(data: Date) {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const diasAntes = primeiroDia.getDay();
    const diasDepois = 42 - (diasAntes + totalDias);
    const dias = Array.from({ length: totalDias }, (_, i) => i + 1);
  
    return { dias, diasAntes, diasDepois };
  }
  