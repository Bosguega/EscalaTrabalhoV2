import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNoteStore } from '../../src/stores/note'
import { atualizarDados, carregarDados } from '../../src/utils/useDadosApp'

vi.mock('../../src/utils/useDadosApp', () => ({
  carregarDados: vi.fn(),
  atualizarDados: vi.fn()
}))

const dadosBase = {
  versao: 2,
  escala: null,
  anotacoes: null,
  animacao: null,
  tema: null
}

describe('useNoteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      anotacoes: JSON.stringify({ '2026-02-03': 'Consulta' })
    })
    vi.mocked(atualizarDados).mockResolvedValue({
      ...dadosBase,
      anotacoes: JSON.stringify({
        '2026-02-03': 'Consulta',
        '2026-02-04': 'Levar documentos'
      })
    })
  })

  it('carrega as anotações persistidas e compartilha a leitura inicial', async () => {
    const store = useNoteStore()

    const primeiraLeitura = store.carregarAnotacoes()
    const segundaLeitura = store.carregarAnotacoes()

    expect(carregarDados).toHaveBeenCalledTimes(1)
    await Promise.all([primeiraLeitura, segundaLeitura])

    expect(store.anotacoes).toEqual({ '2026-02-03': 'Consulta' })
    expect(store.anotacoesCarregadas).toBe(true)
    expect(store.carregarAnotacao(new Date(2026, 1, 3))).toBe('Consulta')
    expect(store.verificarAnotacao(new Date(2026, 1, 3))).toBe(true)
    expect(store.verificarAnotacao(new Date(2026, 1, 4))).toBe(false)
  })

  it('marca a leitura inicial como concluída quando o carregamento falha', async () => {
    const erro = new Error('falha simulada na leitura inicial')
    vi.mocked(carregarDados).mockRejectedValueOnce(erro)
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useNoteStore()

    await expect(store.carregarAnotacoes()).resolves.toBeUndefined()

    expect(store.anotacoes).toEqual({})
    expect(store.anotacoesCarregadas).toBe(true)
    expect(erroConsole).toHaveBeenCalledWith(
      'Erro ao carregar anotações:',
      erro
    )
    expect(carregarDados).toHaveBeenCalledTimes(1)
  })

  it('salva uma anotação aguardando a leitura inicial e atualiza o estado', async () => {
    const store = useNoteStore()

    await store.salvarAnotacao(new Date(2026, 1, 4), 'Levar documentos')

    expect(carregarDados).toHaveBeenCalledTimes(1)
    expect(atualizarDados).toHaveBeenCalledTimes(1)
    expect(atualizarDados).toHaveBeenCalledWith(expect.any(Function))
    expect(store.anotacoes).toEqual({
      '2026-02-03': 'Consulta',
      '2026-02-04': 'Levar documentos'
    })
  })

  it('propaga falha ao salvar para que a interface possa informar o usuário', async () => {
    const store = useNoteStore()
    const erro = new Error('falha simulada ao persistir')
    vi.mocked(atualizarDados).mockRejectedValueOnce(erro)
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      store.salvarAnotacao(new Date(2026, 1, 4), 'Anotação')
    ).rejects.toBe(erro)

    expect(erroConsole).toHaveBeenCalled()
  })

  it('abre e fecha o modal mantendo a data selecionada apenas enquanto aberto', () => {
    const store = useNoteStore()
    const data = new Date(2026, 1, 3)

    store.abrirModal(data)
    expect(store.modalAberto).toBe(true)
    expect(store.dataSelecionada).toBe(data)

    store.fecharModal()
    expect(store.modalAberto).toBe(false)
    expect(store.dataSelecionada).toBeNull()
  })
})
