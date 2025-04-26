<template>
    <button
      :class="[ 
        'px-4 py-3 text-base rounded transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
        fullWidth ? 'w-full' : '',
        disabled ? 'cursor-not-allowed' : ''
      ]"
      :style="{
        backgroundColor: getButtonColor(),
        color: 'white'
      }"
      :disabled="disabled"
      @click="handleClick"
    >
      <slot>{{ texto }}</slot>
    </button>
  </template>
  
  <script setup lang="ts">
  import { useThemeStore } from '../stores/theme'
  
  const props = defineProps<{
    texto?: string
    tipo?: 'primary' | 'secondary' | 'danger'
    disabled?: boolean
    fullWidth?: boolean
  }>()
  
  const emit = defineEmits<{
    (e: 'click'): void
  }>()
  
  const themeStore = useThemeStore()
  
  function getButtonColor() {
    if (props.disabled) {
      return themeStore.getCurrentTheme().border
    }
    
    switch (props.tipo) {
      case 'primary':
        return themeStore.getCurrentTheme().primary
      case 'secondary':
        return themeStore.getCurrentTheme().secondary
      case 'danger':
        return themeStore.getCurrentTheme().folga
      default:
        return themeStore.getCurrentTheme().primary
    }
  }
  
  function handleClick() {
    if (!props.disabled) {
      emit('click')
    }
  }
  </script>
  