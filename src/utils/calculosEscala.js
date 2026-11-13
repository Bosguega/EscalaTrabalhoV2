export function calcularPadraoEscala(escala) {
  const [trabalho, folga] = escala.split('x').map(Number)
  return { diasTrabalho: trabalho, diasFolga: folga }
}

export function calcularDiasDoMes(data) {
  const primeiroDiaDoMes = new Date(data.getFullYear(), data.getMonth(), 1)
  const ultimoDiaDoMes = new Date(data.getFullYear(), data.getMonth() + 1, 0)

  const diasDoMes = []
  let semanaAtual = []

  for (let i = 0; i < primeiroDiaDoMes.getDay(); i++) {
    const dia = new Date(primeiroDiaDoMes)
    dia.setDate(dia.getDate() - (primeiroDiaDoMes.getDay() - i))
    semanaAtual.push(dia)
  }

  for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
    const dataAtual = new Date(data.getFullYear(), data.getMonth(), dia)
    semanaAtual.push(dataAtual)

    if (dataAtual.getDay() === 6) {
      diasDoMes.push(semanaAtual)
      semanaAtual = []
    }
  }

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

export function isDiaTrabalho(data, dataInicialParam, escalaParam) {
  if (!dataInicialParam) return false

  const dataAtual = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  dataAtual.setHours(0, 0, 0, 0)

  const dataInicialObj = new Date(dataInicialParam)
  dataInicialObj.setHours(0, 0, 0, 0)

  const diasDiferenca = Math.floor(
    (dataAtual.getTime() - dataInicialObj.getTime()) / (1000 * 60 * 60 * 24)
  )
  const { diasTrabalho, diasFolga } = calcularPadraoEscala(escalaParam)
  const ciclo = diasTrabalho + diasFolga
  const posicao = ((diasDiferenca % ciclo) + ciclo) % ciclo

  return posicao < diasTrabalho
}

export function isDiaFolga(data, dataInicialParam, escalaParam) {
  return !isDiaTrabalho(data, dataInicialParam, escalaParam)
}
