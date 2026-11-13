import { defineStore } from 'pinia'
import { ref } from 'vue'
import localforage from 'localforage'
import { carregarDados, salvarDados, type DadosApp } from '../utils/useDadosApp'

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
  const backups = ref<Backup[]>([])
  const ultimoBackup = ref<Date | null>(null)
  const backupAutomatico = ref(true)
  const intervaloBackup = ref(24 * 60 * 60 * 1000)

  async function carregarBackups(): Promise<void> {
    try {
      const backupsArmazenados = await localforage.getItem('backups')
      if (Array.isArray(backupsArmazenados)) {
        backups.value = backupsArmazenados as Backup[]
      }
    } catch (error) {
      console.error('Erro ao carregar backups:', error)
    }
  }

  async function salvarBackups(): Promise<void> {
    try {
      await localforage.setItem('backups', backups.value)
    } catch (error) {
      console.error('Erro ao salvar backups:', error)
      throw error
    }
  }

  async function criarBackup(descricao?: string): Promise<void> {
    try {
      const dados = await carregarDados()
      const backup: Backup = {
        metadata: {
          timestamp: Date.now(),
          versao: dados.versao,
          descricao
        },
        dados
      }

      backups.value.push(backup)
      ultimoBackup.value = new Date(backup.metadata.timestamp)
      await salvarBackups()
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      throw error
    }
  }

  async function restaurarBackup(timestamp: number): Promise<boolean> {
    try {
      const backup = backups.value.find(b => b.metadata.timestamp === timestamp)
      if (!backup) return false

      await salvarDados(backup.dados)
      return true
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      return false
    }
  }

  async function exportarDados(): Promise<string> {
    try {
      const dados = await carregarDados()
      const backupsAtuais = await localforage.getItem('backups')

      return JSON.stringify({
        dados,
        backups: backupsAtuais ?? [],
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  }

  async function importarDados(dadosJson: string): Promise<boolean> {
    try {
      const dados = JSON.parse(dadosJson)

      if (
        !dados ||
        !dados.dados ||
        typeof dados.dados !== 'object' ||
        !Array.isArray(dados.backups) ||
        typeof dados.timestamp !== 'number'
      ) {
        throw new Error('Formato de dados inválido')
      }

      const dadosImportados = dados.dados as DadosApp
      if (
        typeof dadosImportados.versao !== 'number' ||
        ![1, 2].includes(dadosImportados.versao)
      ) {
        throw new Error('Versão dos dados não suportada')
      }

      await criarBackup('Backup automático antes da importação')
      await salvarDados(dadosImportados)
      backups.value = dados.backups as Backup[]
      await salvarBackups()

      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }

  async function limparBackupsAntigos(): Promise<void> {
    if (backups.value.length > 10) {
      backups.value = backups.value
        .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
        .slice(0, 10)
      await salvarBackups()
    }
  }

  function iniciarBackupAutomatico(): void {
    if (!backupAutomatico.value) return

    setInterval(async () => {
      const agora = new Date()
      const ultimoBackupTime = ultimoBackup.value?.getTime() || 0

      if (agora.getTime() - ultimoBackupTime >= intervaloBackup.value) {
        await criarBackup('Backup automático')
        await limparBackupsAntigos()
      }
    }, 60 * 60 * 1000)
  }

  carregarBackups()
  iniciarBackupAutomatico()

  return {
    backups,
    ultimoBackup,
    backupAutomatico,
    intervaloBackup,
    criarBackup,
    restaurarBackup,
    exportarDados,
    importarDados,
    limparBackupsAntigos
  }
})
