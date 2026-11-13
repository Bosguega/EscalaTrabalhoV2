import test from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate as aguardarProximoCiclo } from 'node:timers'
import { criarPersistenciaDados } from '../src/utils/persistenciaDados.js'

const dadosPadrao = {
  versao: 2,
  escala: null,
  anotacoes: null,
  animacao: null,
  tema: null
}

function criarArmazenamentoInicial(valor = null) {
  let dados = valor === null ? null : structuredClone(valor)

  return {
    async getItem() {
      return dados === null ? null : structuredClone(dados)
    },
    async setItem(_chave, valorNovo) {
      dados = structuredClone(valorNovo)
      return valorNovo
    },
    consultar() {
      return dados === null ? null : structuredClone(dados)
    }
  }
}

function criarPersistencia(storage) {
  return criarPersistenciaDados(storage, 'appData', dadosPadrao)
}

test('atualizações simultâneas de campos diferentes preservam todos os dados', async () => {
  const storage = criarArmazenamentoInicial()
  const persistencia = criarPersistencia(storage)

  await Promise.all([
    persistencia.atualizarDados({ escala: '{"turno":"manhã"}' }),
    persistencia.atualizarDados({ tema: 'escuro' }),
    persistencia.atualizarDados({ anotacoes: '{"nota":"teste"}' })
  ])

  assert.deepEqual(storage.consultar(), {
    versao: 2,
    escala: '{"turno":"manhã"}',
    anotacoes: '{"nota":"teste"}',
    animacao: null,
    tema: 'escuro'
  })
})

test('callback de atualização recebe o estado persistido mais recente', async () => {
  const storage = criarArmazenamentoInicial()
  const persistencia = criarPersistencia(storage)

  await persistencia.atualizarDados({ anotacoes: 'nota inicial' })

  const resultado = await persistencia.atualizarDados((dadosAtuais) => ({
    anotacoes: dadosAtuais.anotacoes + ' + complemento'
  }))

  assert.equal(resultado.anotacoes, 'nota inicial + complemento')
  assert.equal(storage.consultar().anotacoes, 'nota inicial + complemento')
})

test('leitura aguarda a conclusão de uma gravação solicitada anteriormente', async () => {
  let liberarGravacao
  let gravacaoIniciada = false
  let leituraExecutada = false
  const storage = {
    async getItem() {
      leituraExecutada = true
      return { ...dadosPadrao }
    },
    async setItem(_chave, valor) {
      gravacaoIniciada = true
      await new Promise((resolve) => {
        liberarGravacao = resolve
      })
      return valor
    }
  }
  const persistencia = criarPersistencia(storage)

  const gravacao = persistencia.salvarDados({ ...dadosPadrao, escala: 'nova escala' })
  await new Promise(aguardarProximoCiclo)
  assert.equal(gravacaoIniciada, true)

  const leitura = persistencia.carregarDados()
  await new Promise(aguardarProximoCiclo)
  assert.equal(leituraExecutada, false)

  liberarGravacao()
  await gravacao
  await leitura

  assert.equal(leituraExecutada, true)
})

test('falha de armazenamento é propagada e não bloqueia atualizações seguintes', async () => {
  const storage = criarArmazenamentoInicial()
  const erroEsperado = new Error('falha simulada de armazenamento')
  const setItemOriginal = storage.setItem.bind(storage)
  let falharUmaVez = true

  storage.setItem = async (chave, valor) => {
    if (falharUmaVez) {
      falharUmaVez = false
      throw erroEsperado
    }
    return setItemOriginal(chave, valor)
  }

  const persistencia = criarPersistencia(storage)
  const consoleErrorOriginal = console.error
  console.error = () => {}

  try {
    await assert.rejects(
      persistencia.atualizarDados({ escala: 'não gravada' }),
      erroEsperado
    )

    await persistencia.atualizarDados({ tema: 'escuro' })
    assert.equal(storage.consultar().tema, 'escuro')
    assert.equal(storage.consultar().escala, null)
  } finally {
    console.error = consoleErrorOriginal
  }
})

test('migra dados legados da versão 1 para a estrutura atual', async () => {
  const storage = criarArmazenamentoInicial({
    versao: 1,
    escala: 'escala antiga',
    anotacoes: 'anotações antigas'
  })
  const persistencia = criarPersistencia(storage)

  assert.deepEqual(await persistencia.carregarDados(), {
    versao: 2,
    escala: 'escala antiga',
    anotacoes: 'anotações antigas',
    animacao: null,
    tema: null
  })
})

test('versão desconhecida retorna os valores padrão', async () => {
  const storage = criarArmazenamentoInicial({
    versao: 999,
    escala: 'formato incompatível'
  })
  const persistencia = criarPersistencia(storage)

  assert.deepEqual(await persistencia.carregarDados(), dadosPadrao)
})
