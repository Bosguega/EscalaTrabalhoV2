import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ehDadosAppValido,
  ehConfiguracoesBackupValida,
  ehBackupValido,
  ehArquivoBackupValido
} from '../src/utils/backupValidation.js'

const dados = {
  versao: 2,
  escala: '{"escala":"2x2","dataInicial":"2026-01-01T00:00:00.000Z"}',
  anotacoes: '{"2026-01-01":"Anotação"}',
  animacao: null,
  tema: 'dark'
}

const configuracoes = {
  escalasPersonalizadas: '[{"valor":"3x2","nome":"3x2"}]',
  backupAutomatico: true,
  intervaloBackup: 86400000
}

function criarBackup(timestamp = 100) {
  return {
    metadata: { timestamp, versao: 2, descricao: 'Teste' },
    dados,
    configuracoes
  }
}

test('aceita estrutura completa de dados do aplicativo', () => {
  assert.equal(ehDadosAppValido(dados), true)
})

test('rejeita versão, campos e tema incompatíveis', () => {
  assert.equal(ehDadosAppValido({ ...dados, versao: 99 }), false)
  assert.equal(ehDadosAppValido({ ...dados, escala: {} }), false)
  assert.equal(ehDadosAppValido({ ...dados, tema: 'tema-inexistente' }), false)
  assert.equal(ehDadosAppValido([]), false)
})

test('aceita configurações de backup válidas', () => {
  assert.equal(ehConfiguracoesBackupValida(configuracoes), true)
  assert.equal(ehConfiguracoesBackupValida({ escalasPersonalizadas: null }), true)
})

test('rejeita escalas personalizadas e intervalos inválidos', () => {
  assert.equal(ehConfiguracoesBackupValida({ escalasPersonalizadas: '{' }), false)
  assert.equal(ehConfiguracoesBackupValida({ escalasPersonalizadas: '[{}]' }), false)
  assert.equal(ehConfiguracoesBackupValida({ backupAutomatico: 'sim' }), false)
  assert.equal(ehConfiguracoesBackupValida({ intervaloBackup: Infinity }), false)
  assert.equal(ehConfiguracoesBackupValida({ intervaloBackup: 0 }), false)
})

test('aceita backup completo e compatível', () => {
  assert.equal(ehBackupValido(criarBackup()), true)
})

test('rejeita backup com timestamp ou conteúdo inválido', () => {
  assert.equal(ehBackupValido({ ...criarBackup(), metadata: { timestamp: NaN } }), false)
  assert.equal(ehBackupValido({ ...criarBackup(), dados: { versao: 9 } }), false)
  assert.equal(ehBackupValido({ ...criarBackup(), configuracoes: { intervaloBackup: -1 } }), false)
})

test('aceita arquivo exportado válido', () => {
  assert.equal(ehArquivoBackupValido({
    dados,
    backups: [criarBackup()],
    configuracoes,
    timestamp: 200
  }), true)
})

test('rejeita arquivo incompleto ou com dados principais inválidos', () => {
  assert.equal(ehArquivoBackupValido({ dados, backups: [], timestamp: '200' }), false)
  assert.equal(ehArquivoBackupValido({ dados: {}, backups: [], timestamp: 200 }), false)
  assert.equal(ehArquivoBackupValido({ dados, backups: {}, timestamp: 200 }), false)
})
