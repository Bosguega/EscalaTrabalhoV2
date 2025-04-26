import { defineStore } from 'pinia'
import { ref } from 'vue'
import { carregarDados, salvarDados } from '../utils/useDadosApp'

// Interface para definir a estrutura de uma animação
export interface Animation {
  id: string
  name: string
  enter: string
  leave: string
  description?: string
}

// Lista de animações disponíveis
const animations: Animation[] = [
  {
    id: 'fade',
    name: 'Fade',
    enter: 'animate__animated animate__fadeIn',
    leave: 'animate__animated animate__fadeOut',
    description: 'Efeito de desvanecimento suave'
  },
  {
    id: 'slide-horizontal',
    name: 'Deslizar Horizontal',
    enter: 'animate__animated animate__slideInRight',
    leave: 'animate__animated animate__slideOutLeft',
    description: 'Desliza horizontalmente'
  },
  {
    id: 'slide-vertical',
    name: 'Deslizar Vertical',
    enter: 'animate__animated animate__slideInDown',
    leave: 'animate__animated animate__slideOutUp',
    description: 'Desliza verticalmente'
  },
  {
    id: 'flip',
    name: 'Virar',
    enter: 'animate__animated animate__flipInX',
    leave: 'animate__animated animate__flipOutX',
    description: 'Efeito de virar a página'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    enter: 'animate__animated animate__zoomIn',
    leave: 'animate__animated animate__zoomOut',
    description: 'Efeito de zoom'
  },
  {
    id: 'bounce',
    name: 'Quicar',
    enter: 'animate__animated animate__bounceIn',
    leave: 'animate__animated animate__bounceOut',
    description: 'Efeito de quicar'
  }
]

export const useAnimationStore = defineStore('animation', () => {
  const selectedAnimation = ref<Animation>(animations[0])

  // Função para selecionar uma animação pelo ID
  async function selectAnimation(id: string): Promise<void> {
    const animation = animations.find(anim => anim.id === id)
    if (animation) {
      selectedAnimation.value = animation
      // Salvar preferência do usuário
      try {
        const dados = await carregarDados()
        await salvarDados({ ...dados, animacao: id })
      } catch (error) {
        console.error('Erro ao salvar animação:', error)
      }
    }
  }

  // Carregar preferência do usuário do localStorage
  async function loadAnimationPreference(): Promise<void> {
    try {
      const dados = await carregarDados()
      if (dados.animacao) {
        selectAnimation(dados.animacao)
      }
    } catch (error) {
      console.error('Erro ao carregar animação:', error)
    }
  }

  return {
    animations,
    selectedAnimation,
    selectAnimation,
    loadAnimationPreference
  }
}) 