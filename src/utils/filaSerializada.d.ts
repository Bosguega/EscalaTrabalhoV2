export declare function criarFilaSerializada(): <T>(
  operacao: () => Promise<T>
) => Promise<T>
