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
  import { getCurrentTheme } from '../utils/theme'
  
  const props = defineProps<{
    texto?: string
    tipo?: 'primary' | 'secondary' | 'danger'
    disabled?: boolean
    fullWidth?: boolean
  }>()
  
  const emit = defineEmits<{
    (e: 'click'): void
  }>()
  
  function getButtonColor() {
    if (props.disabled) {
      return getCurrentTheme().border
    }
    
    switch (props.tipo) {
      case 'primary':
        return getCurrentTheme().primary
      case 'secondary':
        return getCurrentTheme().secondary
      case 'danger':
        return getCurrentTheme().folga
      default:
        return getCurrentTheme().primary
    }
  }
  
  function handleClick() {
    if (!props.disabled) {
      emit('click')
    }
  }
  </script>
  