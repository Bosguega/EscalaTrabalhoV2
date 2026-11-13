import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calcularPadraoEscala,
  calcularDiasDoMes,
  isDiaTrabalho,
  isDiaFolga
} from '../src/utils/calculosEscala.js'

test('interpreta escalas no formato trabalho x folga', () => {
  assert.deepEqual(calcularPadraoEscala('2x2'), { diasTrabalho: 2, diasFolga: 2 })
  assert.deepEqual(calcularPadraoEscala('12x3'), { diasTrabalho: 12, diasFolga: 3 })
})

test('identifica corretamente os dias de trabalho e folga no ciclo', () => {
  const inicio = new Date(2025, 0, 1)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 1), inicio, '2x2'), true)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 2), inicio, '2x2'), true)
  assert.equal(isDiaFolga(new Date(2025, 0, 3), inicio, '2x2'), true)
  assert.equal(isDiaFolga(new Date(2025, 0, 4), inicio, '2x2'), true)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 5), inicio, '2x2'), true)
})

test('calcula corretamente datas anteriores ao início da escala', () => {
  const inicio = new Date(2025, 0, 1)
  assert.equal(isDiaTrabalho(new Date(2024, 11, 30), inicio, '2x2'), false)
  assert.equal(isDiaTrabalho(new Date(2024, 11, 31), inicio, '2x2'), false)
})

test('considera corretamente ciclos com quantidades diferentes de trabalho e folga', () => {
  const inicio = new Date(2025, 0, 10)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 10), inicio, '3x1'), true)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 11), inicio, '3x1'), true)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 12), inicio, '3x1'), true)
  assert.equal(isDiaFolga(new Date(2025, 0, 13), inicio, '3x1'), true)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 14), inicio, '3x1'), true)
})

test('ignora o horário e compara somente o dia do calendário', () => {
  const inicio = new Date(2025, 0, 1, 23, 45)
  assert.equal(isDiaTrabalho(new Date(2025, 0, 2, 0, 5), inicio, '2x2'), true)
})

test('não altera as datas recebidas ao calcular a escala', () => {
  const data = new Date(2025, 0, 2, 15, 30)
  const inicio = new Date(2025, 0, 1, 9, 0)
  const dataOriginal = data.getTime()
  const inicioOriginal = inicio.getTime()

  isDiaTrabalho(data, inicio, '2x2')

  assert.equal(data.getTime(), dataOriginal)
  assert.equal(inicio.getTime(), inicioOriginal)
})

test('monta semanas completas de domingo a sábado em fevereiro de ano bissexto', () => {
  const semanas = calcularDiasDoMes(new Date(2024, 1, 15))

  assert.equal(semanas.length, 5)
  assert.ok(semanas.every(semana => semana.length === 7))
  assert.deepEqual(
    semanas.flat().map(data => [data.getFullYear(), data.getMonth(), data.getDate()]),
    Array.from({ length: 35 }, (_, indice) => {
      const data = new Date(2024, 0, 28 + indice)
      return [data.getFullYear(), data.getMonth(), data.getDate()]
    })
  )
})

test('monta quatro semanas quando o mês ocupa exatamente 28 dias', () => {
  const semanas = calcularDiasDoMes(new Date(2026, 1, 1))

  assert.equal(semanas.length, 4)
  assert.ok(semanas.every(semana => semana.length === 7))
  assert.equal(semanas[0][0].getDate(), 1)
  assert.equal(semanas[3][6].getDate(), 28)
})
