export interface StorageAdapter {
  getItem<T = unknown>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<T>
}

export type AtualizacaoPersistencia<T extends { versao: number }> =
  | Partial<Omit<T, 'versao'>>
  | ((dadosAtuais: T) => Partial<Omit<T, 'versao'>>)

export declare function criarPersistenciaDados<T extends { versao: number }>(
  storage: StorageAdapter,
  storageKey: string,
  dadosPadrao: T
): {
  carregarDados(): Promise<T>
  salvarDados(dados: T): Promise<void>
  atualizarDados(atualizacao: AtualizacaoPersistencia<T>): Promise<T>
  resetarDados(): Promise<void>
}
