import test from 'node:test'
import assert from 'node:assert/strict'
import { gerarMesesDoAno } from '../src/utils/calendarioUtils.js'

test('gera os doze meses em ordem, de janeiro a dezembro', () => {
  const meses = gerarMesesDoAno(2026)

  assert.equal(meses.length, 12)
  assert.deepEqual(meses.map(mes => mes.numero), Array.from({ length: 12 }, (_, i) => i))
  assert.equal(meses[0].nome, 'Janeiro')
  assert.equal(meses[11].nome, 'Dezembro')
})

test('gera a quantidade correta de dias para cada mês', () => {
  const meses = gerarMesesDoAno(2025)

  assert.deepEqual(
    meses.map(mes => mes.dias.length),
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  )
  assert.deepEqual(meses[0].dias, Array.from({ length: 31 }, (_, i) => i + 1))
})

test('considera 29 dias em fevereiro de ano bissexto', () => {
  const fevereiro = gerarMesesDoAno(2024)[1]

  assert.equal(fevereiro.dias.length, 29)
  assert.equal(fevereiro.dias[28], 29)
})

test('calcula os espaços anteriores conforme o dia da semana', () => {
  const meses = gerarMesesDoAno(2026)

  // 1º de janeiro de 2026 cai numa quinta-feira (domingo = 0).
  assert.equal(meses[0].diasAntes, 4)
  // 1º de fevereiro de 2026 cai num domingo.
  assert.equal(meses[1].diasAntes, 0)
})

test('completa cada mês com exatamente 42 posições de calendário', () => {
  const meses = gerarMesesDoAno(2024)

  for (const mes of meses) {
    assert.ok(mes.diasAntes >= 0 && mes.diasAntes <= 6)
    assert.ok(mes.diasDepois >= 0 && mes.diasDepois <= 6)
    assert.equal(mes.diasAntes + mes.dias.length + mes.diasDepois, 42)
  }
})

test('não compartilha ou altera listas de dias entre meses', () => {
  const meses = gerarMesesDoAno(2026)
  const diasFevereiro = [...meses[1].dias]

  meses[0].dias.push(32)

  assert.deepEqual(meses[1].dias, diasFevereiro)
  assert.equal(meses[1].dias.length, 28)
})
