export function formatarDataChave(data) {
  if (!data) return ''
  const ano = data.getFullYear()
  const mes = (data.getMonth() + 1).toString().padStart(2, '0')
  const dia = data.getDate().toString().padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function verificarAnotacao(anotacoes, data) {
  const chave = formatarDataChave(data)
  return !!anotacoes?.[chave] && anotacoes[chave].trim() !== ''
}

export function carregarAnotacao(anotacoes, data) {
  const chave = formatarDataChave(data)
  return anotacoes?.[chave] || ''
}
