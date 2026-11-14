import { ehBackupValido } from './backupValidation.js'

export { ehBackupValido }

export function filtrarBackupsValidos(backups) {
  return Array.isArray(backups) ? backups.filter(ehBackupValido) : []
}

export function limitarBackups(backups, limite = 10) {
  return [...backups]
    .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
    .slice(0, limite)
}

export function obterBackupMaisRecente(backups) {
  return backups.reduce(
    (atual, backup) => (
      !atual || backup.metadata.timestamp > atual.metadata.timestamp
        ? backup
        : atual
    ),
    null
  )
}
