import { defineStore } from 'pinia'
import { onScopeDispose, ref, watch } from 'vue'
import localforage from 'localforage'
import { carregarDados, salvarDados, type DadosApp } from '../utils/useDadosApp'

const BACKUPS_KEY = 'backups'
const CONFIG_KEY = 'backupConfig'
const ESCALAS_PERSONALIZADAS_KEY = 'escalas_personalizadas'
const LIMITE_BACKUPS = 10
const INTERVALO_VERIFICACAO = 60 * 60 * 1000

interface BackupMetadata {
  timestamp: number
  versao: number
  descricao?: string
}

interface ConfiguracoesBackup {
  escalasPersonalizadas: string | null
  backupAutomatico?: boolean
  intervaloBackup?: number
}

interface Backup {
  metadata: BackupMetadata
  dados: DadosApp
  configuracoes?: ConfiguracoesBackup
}

interface ConfiguracaoAutomatica {
  backupAutomatico: boolean
  intervaloBackup: number
}

export const useBackupStore = defineStore('backup', () => {
  const backups = ref<Backup[]>([])
  const ultimoBackup = ref<Date | null>(null)
  const backupAutomatico = ref(true)
  const intervaloBackup = ref(24 * 60 * 60 * 1000)

  let timerBackup: ReturnType<typeof setTimeout> | null = null
  let inicializacaoPromise: Promise<void> = Promise.resolve()
  let inicializacaoConcluida = false
  let criandoBackupAutomatico = false

  function lerEscalasPersonalizadas(): string | null {
    try {
      return localStorage.getItem(ESCALAS_PERSONALIZADAS_KEY)
    } catch (error) {
      console.error('Erro ao ler escalas personalizadas:', error)
      return null
    }
  }

  function aplicarConfiguracoes(configuracoes?: ConfiguracoesBackup): void {
    if (!configuracoes) return

    try {
      if (configuracoes.escalasPersonalizadas === null) {
        localStorage.removeItem(ESCALAS_PERSONALIZADAS_KEY)
      } else if (typeof configuracoes.escalasPersonalizadas === 'string') {
        localStorage.setItem(
          ESCALAS_PERSONALIZADAS_KEY,
          configuracoes.escalasPersonalizadas
        )
      }
    } catch (error) {
      console.error('Erro ao restaurar escalas personalizadas:', error)
    }

    if (typeof configuracoes.backupAutomatico === 'boolean') {
      backupAutomatico.value = configuracoes.backupAutomatico
    }

    if (
      typeof configuracoes.intervaloBackup === 'number' &&
      Number.isFinite(configuracoes.intervaloBackup) &&
      configuracoes.intervaloBackup > 0
    ) {
      intervaloBackup.value = configuracoes.intervaloBackup
    }
  }

  function capturarConfiguracoes(): ConfiguracoesBackup {
    return {
      escalasPersonalizadas: lerEscalasPersonalizadas(),
      backupAutomatico: backupAutomatico.value,
      intervaloBackup: intervaloBackup.value
    }
  }

  async function salvarConfiguracaoAutomatica(): Promise<void> {
    const configuracao: ConfiguracaoAutomatica = {
      backupAutomatico: backupAutomatico.value,
      intervaloBackup: intervaloBackup.value
    }

    try {
      await localforage.setItem(CONFIG_KEY, configuracao)
    } catch (error) {
      console.error('Erro ao salvar configurações de backup:', error)
    }
  }

  async function carregarBackups(): Promise<void> {
    try {
      const backupsArmazenados = await localforage.getItem<unknown>(BACKUPS_KEY)
      if (Array.isArray(backupsArmazenados)) {
        backups.value = backupsArmazenados.filter((item): item is Backup => {
          const backup = item as Backup
          return Boolean(
            backup &&
            backup.metadata &&
            typeof backup.metadata.timestamp === 'number' &&
            backup.dados &&
            typeof backup.dados === 'object'
          )
        })
      }

      atualizarUltimoBackup()
      await limparBackupsAntigos()
    } catch (error) {
      console.error('Erro ao carregar backups:', error)
    }
  }

  async function salvarBackups(): Promise<void> {
    await localforage.setItem(BACKUPS_KEY, backups.value)
  }

  async function criarBackup(descricao?: string): Promise<void> {
    await inicializacaoPromise
    const backupsAnteriores = backups.value
    const dados = await carregarDados()
    const backup: Backup = {
      metadata: {
        timestamp: Date.now(),
        versao: dados.versao,
        descricao
      },
      dados,
      configuracoes: capturarConfiguracoes()
    }

    backups.value = [backup, ...backups.value]
      .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
      .slice(0, LIMITE_BACKUPS)

    try {
      await salvarBackups()
      ultimoBackup.value = new Date(backup.metadata.timestamp)
    } catch (error) {
      backups.value = backupsAnteriores
      atualizarUltimoBackup()
      throw error
    }
  }

  async function restaurarBackup(timestamp: number): Promise<boolean> {
    try {
      await inicializacaoPromise
      const backup = backups.value.find(
        item => item.metadata.timestamp === timestamp
      )
      if (!backup) return false

      await salvarDados(backup.dados)
      aplicarConfiguracoes(backup.configuracoes)
      await salvarConfiguracaoAutomatica()
      return true
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      return false
    }
  }

  async function exportarDados(): Promise<string> {
    await inicializacaoPromise
    const dados = await carregarDados()

    return JSON.stringify({
      dados,
      backups: backups.value,
      configuracoes: capturarConfiguracoes(),
      timestamp: Date.now()
    })
  }

  async function importarDados(dadosJson: string): Promise<boolean> {
    try {
      await inicializacaoPromise
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
      const backupsAnteriores = backups.value

      await salvarDados(dadosImportados)

      if (dados.configuracoes) {
        aplicarConfiguracoes(dados.configuracoes as ConfiguracoesBackup)
        await salvarConfiguracaoAutomatica()
      }

      const backupsUnificados = new Map<number, Backup>()
      for (const backup of [...dados.backups, ...backupsAnteriores]) {
        if (
          backup?.metadata &&
          typeof backup.metadata.timestamp === 'number' &&
          backup.dados &&
          typeof backup.dados === 'object'
        ) {
          backupsUnificados.set(backup.metadata.timestamp, backup as Backup)
        }
      }

      backups.value = [...backupsUnificados.values()]
        .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
        .slice(0, LIMITE_BACKUPS)

      await salvarBackups()
      atualizarUltimoBackup()
      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }

  function atualizarUltimoBackup(): void {
    const maisRecente = backups.value.reduce<Backup | null>(
      (atual, backup) => (
        !atual || backup.metadata.timestamp > atual.metadata.timestamp
          ? backup
          : atual
      ),
      null
    )

    ultimoBackup.value = maisRecente
      ? new Date(maisRecente.metadata.timestamp)
      : null
  }

  async function limparBackupsAntigos(): Promise<void> {
    const backupsLimitados = [...backups.value]
      .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
      .slice(0, LIMITE_BACKUPS)

    if (backupsLimitados.length !== backups.value.length) {
      backups.value = backupsLimitados
      await salvarBackups()
    }
  }

  function pararBackupAutomatico(): void {
    if (timerBackup !== null) {
      clearTimeout(timerBackup)
      timerBackup = null
    }
  }

  function agendarBackupAutomatico(): void {
    pararBackupAutomatico()
    if (!inicializacaoConcluida || !backupAutomatico.value) return

    const ultimoBackupTime = ultimoBackup.value?.getTime() ?? 0
    const tempoDesdeUltimoBackup = Date.now() - ultimoBackupTime
    const tempoRestante = intervaloBackup.value - tempoDesdeUltimoBackup
    const atraso = Math.max(
      1000,
      Math.min(
        INTERVALO_VERIFICACAO,
        tempoRestante > 0 ? tempoRestante : INTERVALO_VERIFICACAO
      )
    )

    timerBackup = setTimeout(async () => {
      timerBackup = null
      if (!backupAutomatico.value || criandoBackupAutomatico) return

      const ultimoBackupAtual = ultimoBackup.value?.getTime() ?? 0
      if (Date.now() - ultimoBackupAtual >= intervaloBackup.value) {
        criandoBackupAutomatico = true
        try {
          await criarBackup('Backup automático')
        } catch (error) {
          console.error('Falha no backup automático:', error)
        } finally {
          criandoBackupAutomatico = false
        }
      }

      agendarBackupAutomatico()
    }, atraso)
  }

  async function inicializar(): Promise<void> {
    await carregarBackups()

    try {
      const configuracao = await localforage.getItem<unknown>(CONFIG_KEY)
      if (configuracao && typeof configuracao === 'object') {
        const dados = configuracao as Partial<ConfiguracaoAutomatica>

        if (typeof dados.backupAutomatico === 'boolean') {
          backupAutomatico.value = dados.backupAutomatico
        }

        if (
          typeof dados.intervaloBackup === 'number' &&
          Number.isFinite(dados.intervaloBackup) &&
          dados.intervaloBackup > 0
        ) {
          intervaloBackup.value = dados.intervaloBackup
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de backup:', error)
    }

    inicializacaoConcluida = true
    agendarBackupAutomatico()
  }

  watch(backupAutomatico, async () => {
    if (!inicializacaoConcluida) return
    await salvarConfiguracaoAutomatica()
    agendarBackupAutomatico()
  })

  watch(intervaloBackup, async () => {
    if (!inicializacaoConcluida) return
    await salvarConfiguracaoAutomatica()
    agendarBackupAutomatico()
  })

  inicializacaoPromise = inicializar()
  onScopeDispose(pararBackupAutomatico)

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
