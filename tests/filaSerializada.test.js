import test from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate as aguardarProximoCiclo } from 'node:timers'
import { criarFilaSerializada } from '../src/utils/filaSerializada.js'

test('executa operações em sequência, sem sobreposição', async () => {
  const executarNaFila = criarFilaSerializada()
  const eventos = []
  let liberarPrimeira

  const primeira = executarNaFila(() => new Promise((resolve) => {
    eventos.push('primeira-iniciada')
    liberarPrimeira = () => {
      eventos.push('primeira-finalizada')
      resolve('resultado-1')
    }
  }))

  const segunda = executarNaFila(async () => {
    eventos.push('segunda-iniciada')
    return 'resultado-2'
  })

  await new Promise(aguardarProximoCiclo)
  assert.deepEqual(eventos, ['primeira-iniciada'])

  liberarPrimeira()

  assert.equal(await primeira, 'resultado-1')
  assert.equal(await segunda, 'resultado-2')
  assert.deepEqual(eventos, [
    'primeira-iniciada',
    'primeira-finalizada',
    'segunda-iniciada'
  ])
})

test('uma operação com erro não bloqueia as próximas', async () => {
  const executarNaFila = criarFilaSerializada()
  const erroEsperado = new Error('falha simulada')

  await assert.rejects(
    executarNaFila(async () => {
      throw erroEsperado
    }),
    erroEsperado
  )

  const resultado = await executarNaFila(async () => 'operação seguinte')

  assert.equal(resultado, 'operação seguinte')
})

test('preserva a ordem de várias operações solicitadas juntas', async () => {
  const executarNaFila = criarFilaSerializada()
  const ordem = []

  const operacoes = [1, 2, 3, 4].map((numero) =>
    executarNaFila(async () => {
      ordem.push(numero)
      return numero
    })
  )

  assert.deepEqual(await Promise.all(operacoes), [1, 2, 3, 4])
  assert.deepEqual(ordem, [1, 2, 3, 4])
})
