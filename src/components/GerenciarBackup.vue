<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Gerenciar Backup</h2>
    
    <!-- Status do Backup -->
    <div class="mb-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Último backup: {{ ultimoBackupFormatado }}
      </p>
      <div class="flex items-center mt-2">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="backupStore.backupAutomatico"
            class="form-checkbox h-4 w-4 text-blue-600"
          >
          <span class="ml-2 text-sm">Backup automático</span>
        </label>
      </div>
    </div>

    <!-- Ações -->
    <div class="space-y-4">
      <div class="flex gap-2">
        <button
          @click="criarBackupManual"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Criar Backup
        </button>
        <button
          @click="exportarDados"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Exportar Dados
        </button>
        <div class="flex gap-4 mt-4">
          <button
            @click="triggerFileInput"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Importar Dados
          </button>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileImport"
            accept=".json"
            class="hidden"
          />
        </div>
      </div>
    </div>

    <!-- Lista de Backups -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-2">Backups Disponíveis</h3>
      <div class="space-y-2">
        <div
          v-for="backup in backupsOrdenados"
          :key="backup.metadata.timestamp"
          class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <div>
            <p class="font-medium">
              {{ formatarData(backup.metadata.timestamp) }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ backup.metadata.descricao || 'Sem descrição' }}
            </p>
          </div>
          <button
            @click="restaurarBackup(backup.metadata.timestamp)"
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Restaurar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBackupStore } from '../stores/backup'

const backupStore = useBackupStore()
const fileInput = ref<HTMLInputElement | null>(null)

const ultimoBackupFormatado = computed(() => {
  if (!backupStore.ultimoBackup) return 'Nenhum backup realizado'
  return formatarData(backupStore.ultimoBackup.getTime())
})

const backupsOrdenados = computed(() => {
  return [...backupStore.backups].sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
})

function formatarData(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function criarBackupManual() {
  await backupStore.criarBackup('Backup manual')
}

async function restaurarBackup(timestamp: number) {
  if (await backupStore.restaurarBackup(timestamp)) {
    alert('Backup restaurado com sucesso!')
    window.location.reload()
  } else {
    alert('Erro ao restaurar backup')
  }
}

async function exportarDados() {
  try {
    const dados = await backupStore.exportarDados()
    const blob = new Blob([dados], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-escala-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    alert('Erro ao exportar dados')
    console.error(error)
  }
}

async function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const conteudo = e.target?.result as string
      if (await backupStore.importarDados(conteudo)) {
        alert('Dados importados com sucesso!')
        window.location.reload()
      } else {
        alert('Erro ao importar dados')
      }
    } catch (error) {
      alert('Erro ao ler arquivo')
      console.error(error)
    }
  }

  reader.readAsText(file)
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script> 