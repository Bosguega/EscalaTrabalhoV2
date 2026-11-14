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

/**
 * Move uma data para outro mês sem deixar o JavaScript avançar meses extras
 * quando o dia original não existe no mês de destino.
 * Mantém o horário e limita o dia ao último dia do mês de destino.
 */
export function ajustarMes(data, quantidade) {
  const diaOriginal = data.getDate()
  const novaData = new Date(
    data.getFullYear(),
    data.getMonth() + quantidade,
    1,
    data.getHours(),
    data.getMinutes(),
    data.getSeconds(),
    data.getMilliseconds()
  )
  const ultimoDia = new Date(
    novaData.getFullYear(),
    novaData.getMonth() + 1,
    0
  ).getDate()

  novaData.setDate(Math.min(diaOriginal, ultimoDia))
  return novaData
}
