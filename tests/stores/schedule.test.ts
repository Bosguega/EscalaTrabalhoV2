import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useScheduleStore } from '../../src/stores/schedule'
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

const dataInicialSalva = '2026-03-10T12:30:00.000Z'
const coresSalvas = { trabalho: '#123456', folga: '#abcdef' }

function configurarLocalStorage(valor: string | null = null) {
  const armazenamento = new Map<string, string>()
  if (valor !== null) armazenamento.set('escalas_personalizadas', valor)

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((chave: string) => armazenamento.get(chave) ?? null),
    setItem: vi.fn((chave: string, conteudo: string) => armazenamento.set(chave, conteudo)),
    removeItem: vi.fn((chave: string) => armazenamento.delete(chave))
  })
}

describe('useScheduleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    configurarLocalStorage()
    vi.mocked(carregarDados).mockResolvedValue({ ...dadosBase })
    vi.mocked(atualizarDados).mockResolvedValue({ ...dadosBase })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('inicia com a escala padrão, cores padrão e opções fixas', () => {
    const store = useScheduleStore()

    expect(store.escalaAtual).toBe('2x2')
    expect(store.cores).toEqual({ trabalho: '#ef4444', folga: '#22c55e' })
    expect(store.escalasPersonalizadas).toEqual([])
    expect(store.escalasDisponiveis).toEqual([
      { valor: '2x2', nome: '2x2 (2 dias de trabalho, 2 de folga)' }
    ])
    expect(store.dataInicial).toBeInstanceOf(Date)
  })

  it('carrega configuração persistida e escalas personalizadas', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      escala: JSON.stringify({
        escala: '3x1',
        dataInicial: dataInicialSalva,
        cores: coresSalvas
      })
    })
    configurarLocalStorage(JSON.stringify([
      { valor: '4x2', nome: '4x2 personalizada' }
    ]))

    const store = useScheduleStore()
    await store.carregarConfiguracao()

    expect(store.escalaAtual).toBe('3x1')
    expect(store.dataInicial.toISOString()).toBe(dataInicialSalva)
    expect(store.cores).toEqual(coresSalvas)
    expect(store.escalasPersonalizadas).toEqual([
      { valor: '4x2', nome: '4x2 personalizada' }
    ])
    expect(store.escalasDisponiveis).toHaveLength(2)
  })

  it('mantém os padrões e registra erro quando a leitura inicial falha', async () => {
    const erro = new Error('falha ao carregar configuração')
    vi.mocked(carregarDados).mockRejectedValueOnce(erro)
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useScheduleStore()

    await expect(store.carregarConfiguracao()).resolves.toBeUndefined()

    expect(store.escalaAtual).toBe('2x2')
    expect(store.cores).toEqual({ trabalho: '#ef4444', folga: '#22c55e' })
    expect(store.escalasPersonalizadas).toEqual([])
    expect(erroConsole).toHaveBeenCalledWith('Erro ao carregar configuração:', erro)
  })

  it('mantém os padrões e não propaga erro quando a configuração está malformada', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      escala: '{json inválido'
    })
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useScheduleStore()

    await expect(store.carregarConfiguracao()).resolves.toBeUndefined()

    expect(store.escalaAtual).toBe('2x2')
    expect(store.cores).toEqual({ trabalho: '#ef4444', folga: '#22c55e' })
    expect(erroConsole).toHaveBeenCalled()
  })

  it('descarta escalas com dias não inteiros e restaura padrão ao carregar configuração', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      escala: JSON.stringify({
        escala: '1.5x1.5',
        dataInicial: dataInicialSalva,
        cores: coresSalvas
      })
    })
    configurarLocalStorage(JSON.stringify([
      { valor: '1.5x1.5', nome: '1.5x1.5' },
      { valor: '4x2', nome: '4x2 personalizada' }
    ]))

    const store = useScheduleStore()
    await store.carregarConfiguracao()

    expect(store.escalaAtual).toBe('2x2')
    expect(store.escalasPersonalizadas).toEqual([
      { valor: '4x2', nome: '4x2 personalizada' }
    ])
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'escalas_personalizadas',
      JSON.stringify([{ valor: '4x2', nome: '4x2 personalizada' }])
    )
  })

  it('interpreta data inicial sem horário como data local, sem recuar um dia', async () => {
    const fusoOriginal = process.env.TZ
    process.env.TZ = 'America/Sao_Paulo'

    try {
      vi.mocked(carregarDados).mockResolvedValue({
        ...dadosBase,
        escala: JSON.stringify({
          escala: '2x2',
          dataInicial: '2026-03-10'
        })
      })

      const store = useScheduleStore()
      await store.carregarConfiguracao()

      expect([
        store.dataInicial.getFullYear(),
        store.dataInicial.getMonth(),
        store.dataInicial.getDate()
      ]).toEqual([2026, 2, 10])
    } finally {
      if (fusoOriginal === undefined) {
        delete process.env.TZ
      } else {
        process.env.TZ = fusoOriginal
      }
    }
  })

  it('persiste a troca de escala com a data inicial e as cores atuais', async () => {
    const store = useScheduleStore()
    store.dataInicial = new Date(dataInicialSalva)
    store.cores = { ...coresSalvas }

    await store.atualizarEscala('5x2')

    expect(store.escalaAtual).toBe('5x2')
    expect(atualizarDados).toHaveBeenCalledWith({
      escala: JSON.stringify({
        escala: '5x2',
        dataInicial: dataInicialSalva,
        cores: coresSalvas
      })
    })
  })

  it('ignora atualização com escala de formato não inteiro ou inválido', async () => {
    const store = useScheduleStore()

    await store.atualizarEscala('1.5x1.5')
    await store.atualizarEscala('0x2')
    await store.atualizarEscala('invalida')

    expect(store.escalaAtual).toBe('2x2')
    expect(atualizarDados).not.toHaveBeenCalled()
  })

  it('propaga falha ao persistir a troca de escala e mantém o estado atualizado', async () => {
    const store = useScheduleStore()
    const erro = new Error('falha simulada ao salvar a escala')
    vi.mocked(atualizarDados).mockRejectedValueOnce(erro)

    await expect(store.atualizarEscala('5x2')).rejects.toBe(erro)

    expect(store.escalaAtual).toBe('5x2')
    expect(atualizarDados).toHaveBeenCalledWith({
      escala: JSON.stringify({
        escala: '5x2',
        dataInicial: store.dataInicial.toISOString(),
        cores: store.cores
      })
    })
  })

  it('persiste alterações da data inicial e das cores', async () => {
    const store = useScheduleStore()
    const novaData = new Date('2026-04-15T08:00:00.000Z')
    const novasCores = { trabalho: '#111111', folga: '#eeeeee' }

    await store.atualizarDataInicial(novaData)
    expect(store.dataInicial).toBe(novaData)
    expect(atualizarDados).toHaveBeenLastCalledWith({
      escala: JSON.stringify({
        escala: '2x2',
        dataInicial: novaData.toISOString(),
        cores: { trabalho: '#ef4444', folga: '#22c55e' }
      })
    })

    await store.atualizarCores(novasCores)
    expect(store.cores).toEqual(novasCores)
    expect(atualizarDados).toHaveBeenLastCalledWith({
      escala: JSON.stringify({
        escala: '2x2',
        dataInicial: novaData.toISOString(),
        cores: novasCores
      })
    })
  })

  it('adiciona escalas personalizadas válidas e ignora valores inválidos ou duplicados', () => {
    const store = useScheduleStore()

    store.adicionarEscalaPersonalizada(3, 1)
    store.adicionarEscalaPersonalizada(60, 60)
    store.adicionarEscalaPersonalizada(3, 1)
    store.adicionarEscalaPersonalizada(0, 2)
    store.adicionarEscalaPersonalizada(2, 0)
    store.adicionarEscalaPersonalizada(-1, 2)
    store.adicionarEscalaPersonalizada(2, -1)
    store.adicionarEscalaPersonalizada(1.5, 2)
    store.adicionarEscalaPersonalizada(2, 1.5)
    store.adicionarEscalaPersonalizada(Number.NaN, 2)
    store.adicionarEscalaPersonalizada(2, Number.POSITIVE_INFINITY)
    store.adicionarEscalaPersonalizada(2, 2)

    expect(store.escalasPersonalizadas).toEqual([
      { valor: '3x1', nome: '3x1 (3 dias de trabalho, 1 de folga)' },
      { valor: '60x60', nome: '60x60 (60 dias de trabalho, 60 de folga)' }
    ])
    expect(localStorage.setItem).toHaveBeenCalledTimes(2)
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'escalas_personalizadas',
      JSON.stringify(store.escalasPersonalizadas)
    )
  })

  it('remove escala personalizada e persiste a lista atualizada', () => {
    configurarLocalStorage(JSON.stringify([
      { valor: '3x1', nome: '3x1 personalizada' },
      { valor: '4x2', nome: '4x2 personalizada' }
    ]))
    const store = useScheduleStore()
    store.escalasPersonalizadas = [
      { valor: '3x1', nome: '3x1 personalizada' },
      { valor: '4x2', nome: '4x2 personalizada' }
    ]

    store.removerEscalaPersonalizada('3x1')

    expect(store.escalasPersonalizadas).toEqual([
      { valor: '4x2', nome: '4x2 personalizada' }
    ])
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'escalas_personalizadas',
      JSON.stringify([{ valor: '4x2', nome: '4x2 personalizada' }])
    )
  })
})
