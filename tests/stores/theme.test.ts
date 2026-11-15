import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '../../src/stores/theme'
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

const classList = {
  add: vi.fn(),
  remove: vi.fn(),
  toggle: vi.fn()
}

function configurarAmbiente(prefereEscuro = false) {
  vi.stubGlobal('document', {
    documentElement: { classList }
  })
  vi.stubGlobal('window', {
    matchMedia: vi.fn().mockReturnValue({ matches: prefereEscuro })
  })
}

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    configurarAmbiente()
    vi.mocked(carregarDados).mockResolvedValue({ ...dadosBase })
    vi.mocked(atualizarDados).mockResolvedValue({ ...dadosBase })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('inicia com o tema escuro e disponibiliza suas cores', () => {
    const store = useThemeStore()

    expect(store.currentTheme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(store.getCurrentTheme()).toEqual({
      primary: '#2563eb',
      secondary: '#1e293b',
      background: '#111827',
      text: '#ffffff',
      border: '#374151',
      trabalho: '#f87171',
      folga: '#34d399'
    })
    expect(store.availableThemes.map(theme => theme.name)).toEqual([
      'light', 'dark', 'ocean', 'nature', 'sunset', 'space'
    ])
  })

  it('carrega a preferência salva e aplica as classes correspondentes', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      tema: 'ocean'
    })
    const store = useThemeStore()

    await store.loadThemePreference()

    expect(store.currentTheme).toBe('ocean')
    expect(store.isDark).toBe(false)
    expect(classList.remove).toHaveBeenCalledTimes(6)
    expect(classList.add).toHaveBeenCalledWith('theme-ocean')
    expect(classList.toggle).toHaveBeenCalledWith('dark', false)
    expect(atualizarDados).toHaveBeenCalledWith({ tema: 'ocean' })
  })

  it('usa a preferência do sistema quando não há tema salvo', async () => {
    const store = useThemeStore()

    await store.loadThemePreference()

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    expect(store.currentTheme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(atualizarDados).toHaveBeenCalledWith({ tema: 'light' })
  })

  it('usa o tema escuro quando o sistema prefere modo escuro', async () => {
    configurarAmbiente(true)
    const store = useThemeStore()

    await store.loadThemePreference()

    expect(store.currentTheme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(atualizarDados).toHaveBeenCalledWith({ tema: 'dark' })
  })

  it('ignora uma preferência salva inválida e consulta a preferência do sistema', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      tema: 'inexistente' as never
    })
    const store = useThemeStore()

    await store.loadThemePreference()

    expect(store.currentTheme).toBe('light')
    expect(window.matchMedia).toHaveBeenCalled()
    expect(atualizarDados).toHaveBeenCalledWith({ tema: 'light' })
  })

  it('mantém o tema escuro padrão quando a leitura falha', async () => {
    vi.mocked(carregarDados).mockRejectedValueOnce(new Error('falha de leitura'))
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useThemeStore()

    await expect(store.loadThemePreference()).resolves.toBeUndefined()

    expect(store.currentTheme).toBe('dark')
    expect(classList.add).toHaveBeenCalledWith('theme-dark')
    expect(atualizarDados).toHaveBeenCalledWith({ tema: 'dark' })
    expect(erroConsole).not.toHaveBeenCalled()
  })

  it('altera o tema válido, atualiza o estado visual e persiste a preferência', async () => {
    const store = useThemeStore()

    await store.setTheme('space')

    expect(store.currentTheme).toBe('space')
    expect(store.isDark).toBe(true)
    expect(classList.add).toHaveBeenCalledWith('theme-space')
    expect(classList.toggle).toHaveBeenCalledWith('dark', true)
    expect(atualizarDados).toHaveBeenCalledWith({ tema: 'space' })
  })

  it('ignora temas não suportados sem alterar ou persistir a preferência', async () => {
    const store = useThemeStore()

    await store.setTheme('inexistente' as never)

    expect(store.currentTheme).toBe('dark')
    expect(classList.add).not.toHaveBeenCalled()
    expect(atualizarDados).not.toHaveBeenCalled()
  })

  it('propaga falha ao persistir a alteração do tema', async () => {
    const store = useThemeStore()
    const erro = new Error('falha simulada ao salvar')
    vi.mocked(atualizarDados).mockRejectedValueOnce(erro)
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(store.setTheme('nature')).rejects.toBe(erro)

    expect(store.currentTheme).toBe('nature')
    expect(erroConsole).toHaveBeenCalled()
  })
})
