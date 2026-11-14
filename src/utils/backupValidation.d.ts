export interface DadosAppBackup {
  versao: 1 | 2
  escala?: string | null
  anotacoes?: string | null
  animacao?: string | null
  tema?: 'light' | 'dark' | 'ocean' | 'nature' | 'sunset' | 'space' | null
}

export interface ConfiguracoesBackupValidas {
  escalasPersonalizadas?: string | null
  backupAutomatico?: boolean
  intervaloBackup?: number
}

export interface BackupValidado {
  metadata: {
    timestamp: number
    versao?: 1 | 2
    descricao?: string
  }
  dados: DadosAppBackup
  configuracoes?: ConfiguracoesBackupValidas
}

export interface ArquivoBackupValidado {
  dados: DadosAppBackup
  backups: unknown[]
  configuracoes?: ConfiguracoesBackupValidas
  timestamp: number
}

export function ehDadosAppValido(dados: unknown): dados is DadosAppBackup
export function ehConfiguracoesBackupValida(configuracoes: unknown): configuracoes is ConfiguracoesBackupValidas
export function ehBackupValido(item: unknown): item is BackupValidado
export function ehArquivoBackupValido(arquivo: unknown): arquivo is ArquivoBackupValidado
