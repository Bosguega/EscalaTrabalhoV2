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
    assert.ok(mes.diasDepois >= 0 && mes.diasDepois <= 14)
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


test('navega de janeiro para fevereiro sem saltar para março', async () => {
  const { ajustarMes } = await import('../src/utils/calendarioUtils.js')
  const resultado = ajustarMes(new Date(2025, 0, 31), 1)
  assert.equal(resultado.getFullYear(), 2025)
  assert.equal(resultado.getMonth(), 1)
  assert.equal(resultado.getDate(), 28)
})

test('navega de janeiro para dezembro ao voltar um mês', async () => {
  const { ajustarMes } = await import('../src/utils/calendarioUtils.js')
  const resultado = ajustarMes(new Date(2025, 0, 31), -1)
  assert.equal(resultado.getFullYear(), 2024)
  assert.equal(resultado.getMonth(), 11)
  assert.equal(resultado.getDate(), 31)
})

test('limita o dia ao último dia do mês ao voltar de março', async () => {
  const { ajustarMes } = await import('../src/utils/calendarioUtils.js')
  const resultado = ajustarMes(new Date(2025, 2, 31), -1)
  assert.equal(resultado.getMonth(), 1)
  assert.equal(resultado.getDate(), 28)
})

test('mantém o dia quando ele existe no mês de destino', async () => {
  const { ajustarMes } = await import('../src/utils/calendarioUtils.js')
  const resultado = ajustarMes(new Date(2025, 1, 28), 1)
  assert.equal(resultado.getMonth(), 2)
  assert.equal(resultado.getDate(), 28)
})

test('respeita fevereiro em ano bissexto', async () => {
  const { ajustarMes } = await import('../src/utils/calendarioUtils.js')
  const resultado = ajustarMes(new Date(2024, 1, 29), 1)
  assert.equal(resultado.getMonth(), 2)
  assert.equal(resultado.getDate(), 29)
})

test('preserva horário e não modifica a data original', async () => {
  const { ajustarMes } = await import('../src/utils/calendarioUtils.js')
  const original = new Date(2025, 0, 31, 14, 35, 42, 123)
  const resultado = ajustarMes(original, 1)
  assert.equal(original.getMonth(), 0)
  assert.equal(original.getDate(), 31)
  assert.equal(resultado.getHours(), 14)
  assert.equal(resultado.getMinutes(), 35)
  assert.equal(resultado.getSeconds(), 42)
  assert.equal(resultado.getMilliseconds(), 123)
})
