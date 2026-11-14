export interface MesCalendario {
  numero: number
  nome: string
  dias: number[]
  diasAntes: number
  diasDepois: number
}

export declare function gerarMesesDoAno(ano: number): MesCalendario[]
