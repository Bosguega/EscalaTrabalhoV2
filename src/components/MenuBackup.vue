<template>
  <div class="p-4 border-t border-gray-200 dark:border-gray-700">
    <h3 class="text-md font-medium text-gray-800 dark:text-white mb-3">Backup de Dados</h3>
    
    <div class="space-y-2">
      <!-- Botão de Exportar -->
      <button 
        @click="exportarDados" 
        class="w-full py-2 px-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600 transition text-sm flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Exportar Dados
      </button>

      <!-- Botão de Importar -->
      <button 
        @click="importarDados" 
        class="w-full py-2 px-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600 transition text-sm flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Importar Dados
      </button>

      <!-- Input file oculto para importação -->
      <input
        type="file"
        ref="fileInput"
        accept=".json"
        class="hidden"
        @change="handleFileImport"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement | null>(null)

function exportarDados() {
  // Coletar dados do localStorage
  const dados = {
    escala: localStorage.getItem('escala'),
    anotacoes: localStorage.getItem('anotacoes'),
    animacao: localStorage.getItem('animacao'),
    tema: localStorage.getItem('tema')
  }

  // Criar blob e download
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-escala-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function importarDados() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string)
        // Restaurar dados no localStorage
        if (dados.escala) localStorage.setItem('escala', dados.escala)
        if (dados.anotacoes) localStorage.setItem('anotacoes', dados.anotacoes)
        if (dados.animacao) localStorage.setItem('animacao', dados.animacao)
        if (dados.tema) localStorage.setItem('tema', dados.tema)
        
        // Recarregar a página para aplicar as alterações
        window.location.reload()
      } catch (error) {
        alert('Erro ao importar o arquivo. Verifique se é um arquivo JSON válido.')
      }
    }
    reader.readAsText(input.files[0])
  }
}
</script>