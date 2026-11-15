const VERSOES_SUPORTADAS = [1, 2]
const TEMAS_SUPORTADOS = ['light', 'dark', 'ocean', 'nature', 'sunset', 'space']

function ehObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
}

function ehStringOpcional(valor) {
  return valor === undefined || valor === null || typeof valor === 'string'
}

function ehConfiguracaoEscalaValida(valor) {
  if (valor === null || valor === undefined) return true
  if (typeof valor !== 'string') return false

  let configuracao
  try {
    configuracao = JSON.parse(valor)
  } catch {
    return false
  }

  if (!ehObjeto(configuracao)) return false

  const correspondencia = typeof configuracao.escala === 'string'
    ? configuracao.escala.match(/^([1-9]\d*)x([1-9]\d*)$/)
    : null

  if (!correspondencia) return false

  const diasTrabalho = Number(correspondencia[1])
  const diasFolga = Number(correspondencia[2])

  if (
    !Number.isSafeInteger(diasTrabalho) ||
    !Number.isSafeInteger(diasFolga)
  ) {
    return false
  }

  if (
    typeof configuracao.dataInicial !== 'string' ||
    configuracao.dataInicial.trim() === '' ||
    !Number.isFinite(Date.parse(configuracao.dataInicial))
  ) {
    return false
  }

  if (configuracao.cores !== undefined) {
    if (
      !ehObjeto(configuracao.cores) ||
      (configuracao.cores.trabalho !== undefined && typeof configuracao.cores.trabalho !== 'string') ||
      (configuracao.cores.folga !== undefined && typeof configuracao.cores.folga !== 'string')
    ) {
      return false
    }
  }

  return true
}

export function ehDadosAppValido(dados) {
  if (!ehObjeto(dados) || !VERSOES_SUPORTADAS.includes(dados.versao)) {
    return false
  }

  const camposDados = ['escala', 'anotacoes', 'animacao', 'tema']
  if (
    (dados.versao === 2 && !camposDados.every(campo =>
      Object.prototype.hasOwnProperty.call(dados, campo)
    )) ||
    !ehStringOpcional(dados.escala) ||
    !ehStringOpcional(dados.anotacoes) ||
    !ehStringOpcional(dados.animacao) ||
    !ehStringOpcional(dados.tema)
  ) {
    return false
  }

  if (
    dados.versao === 2 &&
    !ehConfiguracaoEscalaValida(dados.escala)
  ) {
    return false
  }

  if (dados.tema != null && !TEMAS_SUPORTADOS.includes(dados.tema)) {
    return false
  }

  return true
}

export function ehConfiguracoesBackupValida(configuracoes) {
  if (!ehObjeto(configuracoes)) return false

  if (
    configuracoes.escalasPersonalizadas !== undefined &&
    configuracoes.escalasPersonalizadas !== null
  ) {
    if (typeof configuracoes.escalasPersonalizadas !== 'string') return false

    try {
      const escalas = JSON.parse(configuracoes.escalasPersonalizadas)
      if (
        !Array.isArray(escalas) ||
        !escalas.every(escala =>
          ehObjeto(escala) &&
          typeof escala.valor === 'string' &&
          /^[1-9]\d*x[1-9]\d*$/.test(escala.valor) &&
          Number.isSafeInteger(Number(escala.valor.split('x')[0])) &&
          Number.isSafeInteger(Number(escala.valor.split('x')[1])) &&
          typeof escala.nome === 'string' &&
          escala.nome.trim().length > 0
        )
      ) {
        return false
      }
    } catch {
      return false
    }
  }

  if (
    configuracoes.backupAutomatico !== undefined &&
    typeof configuracoes.backupAutomatico !== 'boolean'
  ) {
    return false
  }

  if (
    configuracoes.intervaloBackup !== undefined &&
    (
      typeof configuracoes.intervaloBackup !== 'number' ||
      !Number.isFinite(configuracoes.intervaloBackup) ||
      configuracoes.intervaloBackup <= 0
    )
  ) {
    return false
  }

  return true
}

export function ehBackupValido(item) {
  if (
    !ehObjeto(item) ||
    !ehObjeto(item.metadata) ||
    typeof item.metadata.timestamp !== 'number' ||
    !Number.isFinite(item.metadata.timestamp) ||
    item.metadata.timestamp < 0 ||
    !ehDadosAppValido(item.dados)
  ) {
    return false
  }

  if (
    item.metadata.versao !== undefined &&
    !VERSOES_SUPORTADAS.includes(item.metadata.versao)
  ) {
    return false
  }

  if (
    item.metadata.descricao !== undefined &&
    typeof item.metadata.descricao !== 'string'
  ) {
    return false
  }

  return item.configuracoes === undefined ||
    ehConfiguracoesBackupValida(item.configuracoes)
}

export function ehArquivoBackupValido(arquivo) {
  return Boolean(
    ehObjeto(arquivo) &&
    ehDadosAppValido(arquivo.dados) &&
    Array.isArray(arquivo.backups) &&
    typeof arquivo.timestamp === 'number' &&
    Number.isFinite(arquivo.timestamp) &&
    arquivo.timestamp >= 0 &&
    (
      arquivo.configuracoes === undefined ||
      ehConfiguracoesBackupValida(arquivo.configuracoes)
    )
  )
}
