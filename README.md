# Escala de Trabalho

Aplicativo web para organizar uma escala de trabalho em ciclos de dias trabalhados e dias de folga, consultar o calendário mensal e registrar anotações por data.

## Funcionalidades

- Calendário mensal com indicação dos dias de trabalho e de folga.
- Escalas predefinidas e criação de ciclos personalizados.
- Configuração da data inicial e das cores de trabalho e folga.
- Anotações vinculadas a cada dia.
- Temas claro e escuro.
- Visualização do calendário anual.
- Geração e compartilhamento de imagem da escala.
- Backups automáticos e manuais, restauração e importação/exportação de dados.

## Requisitos

- Node.js 22 ou 24.
- npm.

A validação contínua do projeto executa os testes, a verificação de tipos e o build nas duas versões do Node.js.

## Executar localmente

Na pasta do projeto:

```powershell
npm ci
npm run dev
```

O Vite exibirá o endereço local para abrir no navegador (normalmente `http://localhost:5173`).

## Comandos disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run type-check` | Verifica os tipos TypeScript/Vue |
| `npm test` | Executa os testes automatizados |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão de produção |

Para validar as alterações antes de enviá-las:

```powershell
npm run type-check
npm test
npm run build
```

## Armazenamento e segurança dos dados

As configurações, anotações e preferências são armazenadas localmente no navegador. O aplicativo não possui sincronização com uma conta ou servidor; portanto, os dados não são compartilhados automaticamente entre navegadores ou dispositivos.

O armazenamento do navegador pode ser apagado pelo próprio usuário, pelo navegador ou ao limpar os dados do site. Faça exportações ou mantenha backups atualizados para proteger suas informações.

## Instalação como aplicativo (PWA)

O projeto utiliza configuração de Progressive Web App (PWA), com manifesto, ícones e geração automática do Service Worker durante o build. A instalação depende do navegador e do dispositivo.

### Desktop (Chrome ou Edge)

1. Abra o endereço publicado do aplicativo.
2. Use a opção **Instalar aplicativo** exibida na barra de endereço ou no menu do navegador.
3. Confirme a instalação.

### Android (Chrome)

1. Abra o endereço do aplicativo no Chrome.
2. Abra o menu do navegador.
3. Selecione **Instalar app** ou **Adicionar à tela inicial**, conforme a opção apresentada.

### iPhone e iPad (Safari)

1. Abra o endereço do aplicativo no Safari.
2. Toque em **Compartilhar**.
3. Selecione **Adicionar à Tela de Início**.

Os nomes e a disponibilidade dessas opções variam conforme a versão do navegador e do sistema.

### Funcionamento offline e limitações

O Service Worker é gerado pelo Workbox durante o build e utiliza uma lista de recursos da aplicação para pré-cache. O funcionamento offline depende de o Service Worker ter sido instalado e de os recursos necessários terem sido armazenados em cache após o acesso online.

A configuração técnica do PWA não substitui um teste no navegador e não garante que todos os recursos externos ou todas as situações de uso estejam disponíveis offline. Antes de depender do aplicativo sem conexão, faça um teste prático no dispositivo que será utilizado.

Os dados continuam armazenados localmente no navegador; não existe sincronização automática com servidor ou entre dispositivos. A instalação do PWA também não substitui a exportação de dados nem os backups.

### Solução de problemas

Se a instalação ou a abertura do aplicativo apresentar problemas:

1. Confirme que está usando uma versão atualizada do navegador.
2. Abra o aplicativo com conexão à internet.
3. Verifique se há uma atualização disponível e tente abrir novamente.
4. Evite limpar os dados do site antes de exportar ou proteger suas informações.

## Estrutura geral

- `src/components/`: componentes da interface.
- `src/stores/`: estado e regras das funcionalidades.
- `src/utils/`: utilitários, cálculos e persistência.
- `tests/`: testes automatizados.
- `public/`: manifesto, ícones e recursos públicos do PWA.
- `.github/workflows/`: validação e publicação automatizadas.

## Validação contínua e publicação

O workflow está em `.github/workflows/validate.yml` e reúne validação e publicação:

1. Em pull requests direcionadas à branch `main`, executa os testes, a verificação de tipos e o build.
2. Em alterações enviadas à `main`, executa essas mesmas verificações com Node.js 22 e 24.
3. A publicação no GitHub Pages só é iniciada depois que a validação termina com sucesso. O job de publicação utiliza Node.js 24.
4. Também é possível iniciar o workflow manualmente pela aba **Actions** do GitHub; a publicação ocorre quando a execução é iniciada na branch `main`.

Assim, uma falha na validação impede a etapa de publicação.
