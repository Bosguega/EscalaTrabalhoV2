<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
    <div class="w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-card border border-border rounded-3xl shadow-sm p-6 sm:p-8 transition-colors duration-300 mx-auto max-w-lg relative">
      
      <button
        @click="$emit('update:modelValue', false)"
        class="absolute top-6 right-6 p-2 hover:bg-secondary/50 rounded-xl text-text opacity-50 hover:opacity-100 transition-all focus:outline-none z-20"
        aria-label="Fechar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="flex items-center gap-4 mb-8 pr-12">
        <div class="p-4 bg-primary/10 rounded-2xl text-primary flex-shrink-0 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-text tracking-tight">Gerenciamento</h2>
          <p class="text-sm text-text opacity-60 mt-1">Proteja seus dados neste dispositivo</p>
        </div>
      </div>
      
      <p class="text-xs text-text opacity-60 -mt-5 mb-6">Os backups automáticos ficam armazenados neste navegador. Para guardar uma cópia fora dele ou transferir seus dados, use <strong>Salvar Arquivo</strong>.</p>

      <!-- Status do Backup -->
      <div class="mb-8 p-5 bg-card border border-border shadow-sm rounded-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <p class="text-xs font-bold text-text opacity-50 uppercase tracking-widest">Último backup salvo</p>
          <span class="px-3 py-1 text-xs font-bold bg-secondary/10 text-text rounded-lg border border-secondary/20 shadow-sm">
            {{ ultimoBackupFormatado }}
          </span>
        </div>
        <label class="flex items-center justify-between mt-6 cursor-pointer group relative z-10 pt-4 border-t border-border/50">
          <span class="text-sm font-bold text-text group-hover:text-primary transition-colors">Backup Automático Inteligente</span>
          <div class="relative flex items-center justify-center">
            <input
              type="checkbox"
              v-model="backupStore.backupAutomatico"
              class="peer sr-only"
            >
            <div class="w-12 h-7 bg-border rounded-full peer-checked:bg-primary transition-colors"></div>
            <div class="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
          </div>
        </label>
      </div>

      <!-- Ações -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <button
          @click="criarBackupManual"
          class="flex flex-col items-center justify-center p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all text-text active:scale-95 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary mb-3 group-hover:scale-110 transition-transform drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span class="text-sm font-bold tracking-tight">Criar Agora</span>
        </button>

        <button
          @click="exportarDados"
          class="flex flex-col items-center justify-center p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-folga/50 hover:bg-folga/5 transition-all text-text active:scale-95 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-[var(--color-folga)] text-emerald-500 mb-3 group-hover:scale-110 transition-transform drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="text-sm font-bold tracking-tight">Salvar Arquivo</span>
        </button>

        <div class="col-span-2 mt-1">
          <button
            @click="triggerFileInput"
            class="w-full flex items-center justify-center gap-3 p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-secondary/50 hover:bg-secondary/5 transition-all text-text active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm font-bold tracking-tight">Restaurar de um Arquivo</span>
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

      <!-- Lista de Backups -->
      <div>
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-xs font-bold text-text opacity-40 uppercase tracking-widest">Pontos de Restauração</h3>
          <button
            v-if="backupsOrdenados.length > 0"
            @click="removerTodosBackups"
            class="text-xs font-bold text-folga hover:underline disabled:opacity-50"
          >
            Excluir todos
          </button>
        </div>
        <div v-if="backupsOrdenados.length === 0" class="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-3xl opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p class="text-sm font-bold">Nenhum backup disponível</p>
        </div>
        <div v-else class="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          <div
            v-for="backup in backupsOrdenados"
            :key="backup.metadata.timestamp"
            class="flex items-center justify-between p-4 bg-card border border-border hover:border-primary/40 rounded-2xl transition-all shadow-sm group"
          >
            <div class="flex items-center gap-4">
              <div class="p-3 bg-secondary/10 rounded-xl text-secondary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-text text-sm mb-1 tracking-tight">
                  {{ formatarData(backup.metadata.timestamp) }}
                </p>
                <p class="text-[11px] font-medium text-text opacity-60 uppercase tracking-wider">
                  {{ backup.metadata.descricao || 'Automático' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="restaurarBackup(backup.metadata.timestamp)"
                class="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md"
              >
                Aplicar
              </button>
              <button
                @click="removerBackup(backup.metadata.timestamp)"
                class="p-2 text-folga hover:bg-folga/10 rounded-xl transition-colors"
                :aria-label="`Excluir backup de ${formatarData(backup.metadata.timestamp)}`"
                title="Excluir backup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBackupStore } from '../stores/backup'

defineProps<{
  modelValue: boolean
}>()

defineEmits(['update:modelValue'])

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
  const backup = backupStore.backups.find(
    item => item.metadata.timestamp === timestamp
  )
  if (!backup) return

  const data = formatarData(timestamp)
  const confirmar = window.confirm(
    `Restaurar o backup de ${data}?\n\nOs dados atuais do aplicativo serão substituídos pelos dados dessa cópia.\n\nAntes de continuar, certifique-se de que possui uma cópia recente dos dados atuais.`
  )
  if (!confirmar) return

  if (await backupStore.restaurarBackup(timestamp)) {
    alert('Backup restaurado com sucesso!')
    window.location.reload()
  } else {
    alert('Não foi possível restaurar o backup. Os dados atuais foram mantidos sempre que possível.')
  }
}

async function removerBackup(timestamp: number) {
  const data = formatarData(timestamp)
  if (!window.confirm(`Excluir permanentemente o backup de ${data}?\n\nEssa ação não altera os dados atuais do aplicativo.`)) return

  if (!(await backupStore.removerBackup(timestamp))) {
    alert('Não foi possível excluir o backup. Tente novamente.')
  }
}

async function removerTodosBackups() {
  const quantidade = backupStore.backups.length
  if (quantidade === 0) return

  if (!window.confirm(`Excluir permanentemente todos os ${quantidade} backups armazenados neste dispositivo?\n\nEssa ação não altera os dados atuais do aplicativo e não pode ser desfeita.`)) return

  if (!(await backupStore.removerTodosBackups())) {
    alert('Não foi possível excluir os backups. Tente novamente.')
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
  const file = input.files?.[0]
  if (!file) return

  // Permite selecionar novamente o mesmo arquivo em uma próxima tentativa.
  input.value = ''

  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const conteudo = e.target?.result
      if (typeof conteudo !== 'string') {
        throw new Error('O arquivo não retornou um conteúdo de texto válido')
      }

      if (await backupStore.importarDados(conteudo)) {
        alert('Dados importados com sucesso!')
        window.location.reload()
      } else {
        alert('Erro ao importar dados. Verifique se o arquivo é um backup válido.')
      }
    } catch (error) {
      alert('Não foi possível processar o arquivo de backup.')
      console.error('Erro ao processar arquivo de backup:', error)
    }
  }

  reader.onerror = () => {
    alert('Não foi possível ler o arquivo de backup.')
    console.error('Erro na leitura do arquivo:', reader.error)
  }

  reader.onabort = () => {
    alert('A leitura do arquivo de backup foi cancelada.')
  }

  try {
    reader.readAsText(file)
  } catch (error) {
    alert('Não foi possível iniciar a leitura do arquivo de backup.')
    console.error('Erro ao iniciar leitura do arquivo:', error)
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script> 