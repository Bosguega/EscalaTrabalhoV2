/**
 * Calcula os dias do mês organizados em semanas
 * @param data Data de referência
 * @returns Array de semanas, onde cada semana é um array de datas
 */
export function calcularDiasDoMes(data: Date): Date[][] {
  const primeiroDiaDoMes = new Date(data.getFullYear(), data.getMonth(), 1)
  const ultimoDiaDoMes = new Date(data.getFullYear(), data.getMonth() + 1, 0)
  
  const diasDoMes: Date[][] = []
  let semanaAtual: Date[] = []
  
  // Preenche os dias do mês anterior até o primeiro dia do mês atual
  for (let i = 0; i < primeiroDiaDoMes.getDay(); i++) {
    const dia = new Date(primeiroDiaDoMes)
    dia.setDate(dia.getDate() - (primeiroDiaDoMes.getDay() - i))
    semanaAtual.push(dia)
  }
  
  // Preenche os dias do mês atual
  for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
    const dataAtual = new Date(data.getFullYear(), data.getMonth(), dia)
    semanaAtual.push(dataAtual)
    
    if (dataAtual.getDay() === 6) {
      diasDoMes.push(semanaAtual)
      semanaAtual = []
    }
  }
  
  // Preenche os dias do próximo mês até completar a última semana
  if (semanaAtual.length > 0) {
    const ultimoDia = semanaAtual[semanaAtual.length - 1]
    const diasRestantes = 6 - ultimoDia.getDay()
    
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(ultimoDia)
      dia.setDate(dia.getDate() + i)
      semanaAtual.push(dia)
    }
    
    diasDoMes.push(semanaAtual)
  }
  
  return diasDoMes
}

/**
 * Verifica se uma data é dia de trabalho de acordo com a escala
 * @param data Data a ser verificada
 * @param escala Número de dias de trabalho seguidos por dias de folga
 * @param dataInicial Data inicial da escala
 * @returns true se for dia de trabalho, false se for dia de folga
 */
export function verificarDiaDeTrabalho(data: Date, escala: number, dataInicial: Date): boolean {
  const diffTime = Math.abs(data.getTime() - dataInicial.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Se o número de dias desde o início da escala dividido pelo tamanho da escala
  // tiver resto menor que o número de dias de trabalho, é dia de trabalho
  return (diffDays % escala) < Math.floor(escala / 2)
} 