import { createApp } from 'vue'
import './assets/tailwind.css'
import App from './App.vue'

createApp(App).mount('#app')

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const basePath = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${basePath}sw.js`)
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope)
      })
      .catch(error => {
        console.log('Falha ao registrar o Service Worker:', error)
      })
  })
}
