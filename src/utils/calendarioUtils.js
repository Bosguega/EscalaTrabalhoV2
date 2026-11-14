/**
 * Gera os dados de calendário dos 12 meses de um ano.
 * Cada mês reserva 42 posições (6 semanas), preenchidas por dias anteriores,
 * dias do mês e espaços posteriores.
 */
export function gerarMesesDoAno(ano) {
  return Array.from({ length: 12 }, (_, numero) => {
    const primeiroDia = new Date(ano, numero, 1)
    const totalDias = new Date(ano, numero + 1, 0).getDate()
    const diasAntes = primeiroDia.getDay()
    const diasDepois = 42 - (diasAntes + totalDias)
    const dias = Array.from({ length: totalDias }, (_, indice) => indice + 1)

    return {
      numero,
      nome: primeiroDia.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^./, letra => letra.toUpperCase()),
      dias,
      diasAntes,
      diasDepois
    }
  })
}
