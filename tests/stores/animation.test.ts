import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAnimationStore } from '../../src/stores/animation'
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

describe('useAnimationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(carregarDados).mockResolvedValue({ ...dadosBase })
    vi.mocked(atualizarDados).mockResolvedValue({ ...dadosBase })
  })

  it('inicia com a animação Fade selecionada e disponibiliza as opções', () => {
    const store = useAnimationStore()

    expect(store.selectedAnimation).toEqual({
      id: 'fade',
      name: 'Fade',
      enter: 'animate__animated animate__fadeIn',
      leave: 'animate__animated animate__fadeOut',
      description: 'Efeito de desvanecimento suave'
    })
    expect(store.animations.map(animation => animation.id)).toEqual([
      'fade',
      'slide-horizontal',
      'slide-vertical',
      'flip',
      'zoom',
      'bounce'
    ])
  })

  it('carrega a preferência salva e seleciona a animação correspondente', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      animacao: 'slide-horizontal'
    })
    const store = useAnimationStore()

    await store.loadAnimationPreference()

    expect(store.selectedAnimation.id).toBe('slide-horizontal')
    expect(store.selectedAnimation.name).toBe('Deslizar Horizontal')
    expect(carregarDados).toHaveBeenCalledTimes(1)
  })

  it('mantém a animação padrão quando não existe preferência salva', async () => {
    const store = useAnimationStore()

    await store.loadAnimationPreference()

    expect(store.selectedAnimation.id).toBe('fade')
  })

  it('ignora uma preferência salva que não corresponde a uma animação disponível', async () => {
    vi.mocked(carregarDados).mockResolvedValue({
      ...dadosBase,
      animacao: 'animação-inexistente'
    })
    const store = useAnimationStore()

    await store.loadAnimationPreference()

    expect(store.selectedAnimation.id).toBe('fade')
  })

  it('registra erro e mantém a animação atual quando a leitura falha', async () => {
    vi.mocked(carregarDados).mockRejectedValueOnce(new Error('falha de leitura'))
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useAnimationStore()

    await expect(store.loadAnimationPreference()).resolves.toBeUndefined()

    expect(store.selectedAnimation.id).toBe('fade')
    expect(erroConsole).toHaveBeenCalledWith(
      'Erro ao carregar animação:',
      expect.any(Error)
    )
  })

  it('seleciona uma animação válida e persiste seu identificador', async () => {
    const store = useAnimationStore()

    await store.selectAnimation('zoom')

    expect(store.selectedAnimation.id).toBe('zoom')
    expect(store.selectedAnimation.name).toBe('Zoom')
    expect(atualizarDados).toHaveBeenCalledWith({ animacao: 'zoom' })
  })

  it('ignora identificador desconhecido sem alterar ou persistir a seleção', async () => {
    const store = useAnimationStore()

    await store.selectAnimation('inexistente')

    expect(store.selectedAnimation.id).toBe('fade')
    expect(atualizarDados).not.toHaveBeenCalled()
  })

  it('registra falha ao salvar sem propagar erro e mantém a seleção realizada', async () => {
    const store = useAnimationStore()
    const erro = new Error('falha simulada ao salvar')
    vi.mocked(atualizarDados).mockRejectedValueOnce(erro)
    const erroConsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(store.selectAnimation('bounce')).resolves.toBeUndefined()

    expect(store.selectedAnimation.id).toBe('bounce')
    expect(erroConsole).toHaveBeenCalledWith('Erro ao salvar animação:', erro)
  })
})
