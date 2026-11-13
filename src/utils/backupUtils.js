export function ehBackupValido(item) {
  return Boolean(
    item &&
    typeof item === 'object' &&
    item.metadata &&
    typeof item.metadata.timestamp === 'number' &&
    item.dados &&
    typeof item.dados === 'object'
  )
}

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
