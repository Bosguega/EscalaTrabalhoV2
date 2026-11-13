import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatarDataChave,
  verificarAnotacao,
  carregarAnotacao
} from '../src/utils/anotacoesUtils.js'

test('formata chave de data usando ano, mês e dia locais', () => {
  assert.equal(formatarDataChave(new Date(2026, 0, 5, 23, 59)), '2026-01-05')
  assert.equal(formatarDataChave(new Date(2024, 11, 31)), '2024-12-31')
})

test('retorna chave vazia quando a data não foi informada', () => {
  assert.equal(formatarDataChave(null), '')
  assert.equal(formatarDataChave(undefined), '')
})

test('recupera anotação pela data correspondente', () => {
  const anotacoes = { '2026-11-13': 'Compromisso importante' }
  assert.equal(carregarAnotacao(anotacoes, new Date(2026, 10, 13)), 'Compromisso importante')
})

test('retorna texto vazio quando não existe anotação para a data', () => {
  assert.equal(carregarAnotacao({}, new Date(2026, 10, 13)), '')
  assert.equal(carregarAnotacao(null, new Date(2026, 10, 13)), '')
})

test('considera anotação válida quando contém texto não vazio', () => {
  assert.equal(verificarAnotacao({ '2026-11-13': 'Lembrete' }, new Date(2026, 10, 13)), true)
})

test('ignora anotação vazia ou contendo apenas espaços', () => {
  const data = new Date(2026, 10, 13)
  assert.equal(verificarAnotacao({ '2026-11-13': '' }, data), false)
  assert.equal(verificarAnotacao({ '2026-11-13': '   \n  ' }, data), false)
})

test('não considera anotação de outra data', () => {
  const anotacoes = { '2026-11-12': 'Ontem' }
  assert.equal(verificarAnotacao(anotacoes, new Date(2026, 10, 13)), false)
  assert.equal(carregarAnotacao(anotacoes, new Date(2026, 10, 13)), '')
})
