import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ehBackupValido,
  filtrarBackupsValidos,
  limitarBackups,
  obterBackupMaisRecente
} from '../src/utils/backupUtils.js'

function criarBackup(timestamp, dados = { escala: '2x2' }) {
  return { metadata: { timestamp }, dados }
}

test('aceita backup com metadados e dados válidos', () => {
  assert.equal(ehBackupValido(criarBackup(100)), true)
})

test('rejeita estruturas incompletas ou com timestamp inválido', () => {
  assert.equal(ehBackupValido(null), false)
  assert.equal(ehBackupValido({ metadata: {}, dados: {} }), false)
  assert.equal(ehBackupValido({ metadata: { timestamp: '100' }, dados: {} }), false)
  assert.equal(ehBackupValido({ metadata: { timestamp: 100 } }), false)
})

test('filtra entradas inválidas sem descartar backups válidos', () => {
  const valido = criarBackup(100)
  const resultado = filtrarBackupsValidos([null, {}, valido, { metadata: {}, dados: {} }])
  assert.deepEqual(resultado, [valido])
})

test('retorna lista vazia quando o armazenamento não contém uma lista', () => {
  assert.deepEqual(filtrarBackupsValidos(null), [])
  assert.deepEqual(filtrarBackupsValidos({}), [])
})

test('mantém os backups mais recentes dentro do limite', () => {
  const backups = [criarBackup(10), criarBackup(40), criarBackup(20), criarBackup(30)]
  const resultado = limitarBackups(backups, 2)
  assert.deepEqual(resultado.map(item => item.metadata.timestamp), [40, 30])
  assert.equal(backups.length, 4)
})

test('não altera a lista original ao ordenar e limitar', () => {
  const backups = [criarBackup(10), criarBackup(30), criarBackup(20)]
  limitarBackups(backups, 2)
  assert.deepEqual(backups.map(item => item.metadata.timestamp), [10, 30, 20])
})

test('identifica o backup mais recente', () => {
  const backups = [criarBackup(10), criarBackup(50), criarBackup(20)]
  assert.equal(obterBackupMaisRecente(backups), backups[1])
})

test('retorna null quando não há backups', () => {
  assert.equal(obterBackupMaisRecente([]), null)
})
