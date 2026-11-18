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

  it('exclui um backup específico sem alterar os dados atuais e atualiza o último backup', async () => {
    const backupMaisRecente = { ...backupValido, metadata: { ...backupValido.metadata, timestamp: 456 } }
    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return [backupMaisRecente, backupValido]
      return null
    })

    const store = useBackupStore()
    const resultado = await store.removerBackup(123)

    expect(resultado).toBe(true)
    expect(store.backups).toEqual([backupMaisRecente])
    expect(store.ultimoBackup?.getTime()).toBe(456)
    expect(localforage.setItem).toHaveBeenCalledWith('backups', [backupMaisRecente])
    expect(salvarDados).not.toHaveBeenCalled()
  })

  it('permite excluir todos os backups sem alterar os dados atuais', async () => {
    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return [backupValido]
      return null
    })

    const store = useBackupStore()
    const resultado = await store.removerTodosBackups()

    expect(resultado).toBe(true)
    expect(store.backups).toEqual([])
    expect(store.ultimoBackup).toBeNull()
    expect(localforage.setItem).toHaveBeenCalledWith('backups', [])
    expect(salvarDados).not.toHaveBeenCalled()
  })

  it('restaura a lista anterior quando a persistência da exclusão falha', async () => {
    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return [backupValido]
      return null
    })
    vi.mocked(localforage.setItem).mockRejectedValueOnce(new Error('falha ao persistir'))
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    const store = useBackupStore()
    const resultado = await store.removerBackup(123)

    expect(resultado).toBe(false)
    expect(store.backups).toEqual([backupValido])
    expect(store.ultimoBackup?.getTime()).toBe(123)
    expect(erroConsole).toHaveBeenCalled()
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

  it('exporta os dados atuais, backups e configurações em um arquivo JSON válido', async () => {
    const store = useBackupStore()

    await store.criarBackup('Histórico')
    const arquivo = JSON.parse(await store.exportarDados())

    expect(arquivo.dados).toEqual(dadosAtuais)
    expect(arquivo.backups).toHaveLength(1)
    expect(arquivo.backups[0].metadata.descricao).toBe('Histórico')
    expect(arquivo.configuracoes).toMatchObject({
      escalasPersonalizadas: null,
      backupAutomatico: true,
      intervaloBackup: 86400000
    })
    expect(arquivo.timestamp).toEqual(expect.any(Number))
  })

  it('importa dados válidos e preserva o backup de segurança no histórico', async () => {
    const store = useBackupStore()
    const dadosImportados = {
      ...dadosAtuais,
      anotacoes: JSON.stringify({ '2026-05-10': 'Dados importados' })
    }
    const arquivo = {
      dados: dadosImportados,
      backups: [backupValido],
      configuracoes: {
        escalasPersonalizadas: null,
        backupAutomatico: false,
        intervaloBackup: 43200000
      },
      timestamp: 456
    }

    const resultado = await store.importarDados(JSON.stringify(arquivo))

    expect(resultado).toBe(true)
    expect(salvarDados).toHaveBeenCalledWith(dadosImportados)
    expect(store.backupAutomatico).toBe(false)
    expect(store.intervaloBackup).toBe(43200000)
    expect(store.backups).toHaveLength(2)
    expect(store.backups.map(backup => backup.metadata.descricao)).toContain(
      'Backup automático antes da importação'
    )
    expect(localforage.setItem).toHaveBeenCalledWith('backups', expect.any(Array))
  })

  it('reverte os dados anteriores quando a gravação da importação falha', async () => {
    const store = useBackupStore()
    const erro = new Error('falha ao gravar dados importados')
    vi.mocked(carregarDados).mockResolvedValue({ ...dadosAnteriores })
    vi.mocked(salvarDados)
      .mockRejectedValueOnce(erro)
      .mockResolvedValueOnce(undefined)
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    const resultado = await store.importarDados(JSON.stringify({
      dados: dadosAtuais,
      backups: [],
      timestamp: 456
    }))

    expect(resultado).toBe(false)
    expect(salvarDados).toHaveBeenNthCalledWith(1, dadosAtuais)
    expect(salvarDados).toHaveBeenNthCalledWith(2, dadosAnteriores)
    expect(erroConsole).toHaveBeenCalled()
  })


  it('executa o backup automático quando o intervalo configurado já venceu', async () => {
    vi.setSystemTime(new Date('2026-11-15T12:00:00.000Z'))
    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return [backupValido]
      if (chave === 'backupConfig') {
        return { backupAutomatico: true, intervaloBackup: 1000 }
      }
      return null
    })

    const store = useBackupStore()
    await store.restaurarBackup(999)

    expect(store.backupAutomatico).toBe(true)
    expect(store.intervaloBackup).toBe(1000)

    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)

    expect(store.backups[0].metadata.descricao).toBe('Backup automático')
    expect(localforage.setItem).toHaveBeenCalledWith(
      'backups',
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({ descricao: 'Backup automático' })
        })
      ])
    )
  })

  it('não executa backup automático quando a preferência está desativada', async () => {
    vi.setSystemTime(new Date('2026-11-15T12:00:00.000Z'))
    vi.mocked(localforage.getItem).mockImplementation(async (chave: string) => {
      if (chave === 'backups') return [backupValido]
      if (chave === 'backupConfig') {
        return { backupAutomatico: false, intervaloBackup: 1000 }
      }
      return null
    })

    const store = useBackupStore()
    await store.restaurarBackup(999)
    await vi.advanceTimersByTimeAsync(5000)

    expect(store.backupAutomatico).toBe(false)
    expect(store.backups).toHaveLength(1)
    expect(store.backups[0].metadata.descricao).toBe('Backup de teste')
    expect(carregarDados).not.toHaveBeenCalled()
  })
})
