export interface PadraoEscala {
  diasTrabalho: number
  diasFolga: number
}

export declare function calcularPadraoEscala(escala: string): PadraoEscala
export declare function calcularDiasDoMes(data: Date): Date[][]
export declare function isDiaTrabalho(data: Date, dataInicialParam: Date, escalaParam: string): boolean
export declare function isDiaFolga(data: Date, dataInicialParam: Date, escalaParam: string): boolean
