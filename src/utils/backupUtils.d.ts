export interface BackupBasico {
  metadata: { timestamp: number }
  dados: object
}

export function ehBackupValido(item: unknown): item is BackupBasico
export function filtrarBackupsValidos(backups: unknown): BackupBasico[]
export function limitarBackups<T extends BackupBasico>(backups: T[], limite?: number): T[]
export function obterBackupMaisRecente<T extends BackupBasico>(backups: T[]): T | null
