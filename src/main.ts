import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css'
import 'animate.css/animate.min.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
