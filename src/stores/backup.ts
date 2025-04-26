import { defineStore } from 'pinia'
import { ref } from 'vue'
import localforage from 'localforage'
import type { DadosApp } from '../utils/useDadosApp'
import { dadosPadrao } from '../utils/useDadosApp'

interface BackupMetadata {
  timestamp: number
  versao: number
  descricao?: string
}

interface Backup {
  metadata: BackupMetadata
  dados: DadosApp
}

export const useBackupStore = defineStore('backup', () => {
  // Estado
  const backups = ref<Backup[]>([])
  const ultimoBackup = ref<Date | null>(null)
  const backupAutomatico = ref(true)
  const intervaloBackup = ref(24 * 60 * 60 * 1000) // 24 horas em milissegundos

  // Carregar backups do armazenamento local
  async function carregarBackups(): Promise<void> {
    try {
      const backupsArmazenados = await localforage.getItem('backups')
      if (backupsArmazenados) {
        backups.value = backupsArmazenados as Backup[]
      }
    } catch (error) {
      console.error('Erro ao carregar backups:', error)
    }
  }

  // Salvar backups no armazenamento local
  async function salvarBackups(): Promise<void> {
    try {
      await localforage.setItem('backups', backups.value)
    } catch (error) {
      console.error('Erro ao salvar backups:', error)
    }
  }

  // Criar um novo backup
  async function criarBackup(descricao?: string): Promise<void> {
    try {
      const dados = await localforage.getItem('appData') as DadosApp
      if (!dados) return

      const backup: Backup = {
        metadata: {
          timestamp: Date.now(),
          versao: dados.versao,
          descricao
        },
        dados
      }

      backups.value.push(backup)
      ultimoBackup.value = new Date()
      await salvarBackups()
    } catch (error) {
      console.error('Erro ao criar backup:', error)
    }
  }

  // Restaurar um backup específico
  async function restaurarBackup(timestamp: number): Promise<boolean> {
    try {
      const backup = backups.value.find(b => b.metadata.timestamp === timestamp)
      if (!backup) return false

      await localforage.setItem('appData', backup.dados)
      return true
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      return false
    }
  }

  // Exportar todos os dados
  async function exportarDados(): Promise<string> {
    try {
      const dados = await localforage.getItem('appData')
      const backupsAtuais = await localforage.getItem('backups')
      
      const dadosExportacao = {
        dados,
        backups: backupsAtuais,
        timestamp: Date.now()
      }

      return JSON.stringify(dadosExportacao)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  }

  // Importar dados
  async function importarDados(dadosJson: string): Promise<boolean> {
    try {
      const dados = JSON.parse(dadosJson)
      
      // Validar dados
      if (!dados.dados || !dados.backups || !dados.timestamp) {
        throw new Error('Formato de dados inválido')
      }

      // Fazer backup dos dados atuais antes de importar
      await criarBackup('Backup automático antes da importação')

      // Importar dados
      await localforage.setItem('appData', dados.dados)
      backups.value = dados.backups
      await salvarBackups()

      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }

  // Limpar backups antigos (manter apenas os últimos 10)
  async function limparBackupsAntigos(): Promise<void> {
    if (backups.value.length > 10) {
      backups.value = backups.value
        .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
        .slice(0, 10)
      await salvarBackups()
    }
  }

  // Inicializar backup automático
  function iniciarBackupAutomatico(): void {
    if (!backupAutomatico.value) return

    setInterval(async () => {
      const agora = new Date()
      const ultimoBackupTime = ultimoBackup.value?.getTime() || 0
      
      if (agora.getTime() - ultimoBackupTime >= intervaloBackup.value) {
        await criarBackup('Backup automático')
        await limparBackupsAntigos()
      }
    }, 60 * 60 * 1000) // Verificar a cada hora
  }

  // Carregar backups ao inicializar o store
  carregarBackups()
  iniciarBackupAutomatico()

  return {
    // Estado
    backups,
    ultimoBackup,
    backupAutomatico,
    intervaloBackup,

    // Ações
    criarBackup,
    restaurarBackup,
    exportarDados,
    importarDados,
    limparBackupsAntigos
  }
}) 