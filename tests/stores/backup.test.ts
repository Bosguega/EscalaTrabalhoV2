import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, disposePinia, setActivePinia } from 'pinia'
import localforage from 'localforage'
import { useBackupStore } from '../../src/stores/backup'
import { carregarDados, salvarDados } from '../../src/utils/useDadosApp'

vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
}))

vi.mock('../../src/utils/useDadosApp', () => ({
  carregarDados: vi.fn(),
  salvarDados: vi.fn()
}))

const dadosAtuais = {
  versao: 2,
  escala: JSON.stringify({
    escala: '2x2',
    dataInicial: '2026-01-01T00:00:00.000Z'
  }),
  anotacoes: JSON.stringify({ '2026-01-02': 'Nota atual' }),
  animacao: 'fade',
  tema: 'dark' as const
}

const dadosAnteriores = {
  ...dadosAtuais,
  anotacoes: JSON.stringify({ '2026-01-02': 'Nota anterior' })
}

const backupValido = {
  metadata: {
    timestamp: 123,
    versao: 2,
    descricao: 'Backup de teste'
  },
  dados: dadosAtuais,
  configuracoes: {
    escalasPersonalizadas: null,
    backupAutomatico: false,
    intervaloBackup: 86400000
  }
}

let pinia: ReturnType<typeof createPinia>

function configurarLocalStorage(): void {
  const armazenamento = new Map<string, string>()

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((chave: string) => armazenamento.get(chave) ?? null),
    setItem: vi.fn((chave: string, valor: string) => {
      armazenamento.set(chave, valor)
    }),
    removeItem: vi.fn((chave: string) => {
      armazenamento.delete(chave)
    })
  })
}

describe('useBackupStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    configurarLocalStorage()
    pinia = createPinia()
    setActivePinia(pinia)

    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return []
      return null
    })
    vi.mocked(localforage.setItem).mockImplementation(async (_chave: string, valor: unknown) => valor)
    vi.mocked(carregarDados).mockResolvedValue({ ...dadosAtuais })
    vi.mocked(salvarDados).mockResolvedValue(undefined)
  })

  afterEach(() => {
    disposePinia(pinia)
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('cria e persiste um backup com dados e configurações atuais', async () => {
    const store = useBackupStore()

    await store.criarBackup('Backup manual')

    expect(store.backups).toHaveLength(1)
    expect(store.backups[0].metadata.descricao).toBe('Backup manual')
    expect(store.backups[0].dados).toEqual(dadosAtuais)
    expect(store.backups[0].configuracoes).toMatchObject({
      escalasPersonalizadas: null,
      backupAutomatico: true,
      intervaloBackup: 86400000
    })
    expect(localforage.setItem).toHaveBeenCalledWith(
      'backups',
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({ descricao: 'Backup manual' })
        })
      ])
    )
    expect(store.ultimoBackup).toBeInstanceOf(Date)
  })

  it('restaura os dados e as preferências de um backup válido', async () => {
    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return [backupValido]
      return null
    })
    vi.mocked(carregarDados).mockResolvedValue({ ...dadosAnteriores })

    const store = useBackupStore()
    const resultado = await store.restaurarBackup(123)

    expect(resultado).toBe(true)
    expect(salvarDados).toHaveBeenCalledWith(dadosAtuais)
    expect(store.backupAutomatico).toBe(false)
    expect(localforage.setItem).toHaveBeenCalledWith(
      'backupConfig',
      { backupAutomatico: false, intervaloBackup: 86400000 }
    )
  })

  it('rejeita restauração de backup inexistente sem alterar os dados', async () => {
    const store = useBackupStore()

    const resultado = await store.restaurarBackup(999)

    expect(resultado).toBe(false)
    expect(salvarDados).not.toHaveBeenCalled()
  })

  it('rejeita arquivo de importação inválido sem gravar os dados', async () => {
    const store = useBackupStore()

    const resultado = await store.importarDados(JSON.stringify({
      dados: { versao: 999 },
      backups: [],
      timestamp: 456
    }))

    expect(resultado).toBe(false)
    expect(salvarDados).not.toHaveBeenCalled()
  })
})
