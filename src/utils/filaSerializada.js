/**
 * Cria uma fila que executa operações assíncronas uma por vez.
 * Uma falha é devolvida a quem chamou, mas não impede as próximas operações.
 */
export function criarFilaSerializada() {
  let fila = Promise.resolve()

  return function executarNaFila(operacao) {
    const resultado = fila.then(operacao, operacao)
    fila = resultado.then(
      () => undefined,
      () => undefined
    )
    return resultado
  }
}
