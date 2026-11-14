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

- Node.js 22 (mesma versão usada na validação contínua).
- npm.

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

## PWA e instalação

O projeto inclui configuração de Progressive Web App (PWA), com manifesto e recursos de instalação. Consulte [README-PWA.md](README-PWA.md) para as orientações e limitações conhecidas do funcionamento offline.

## Estrutura geral

- `src/components/`: componentes da interface.
- `src/stores/`: estado e regras das funcionalidades.
- `src/utils/`: utilitários, cálculos e persistência.
- `tests/`: testes automatizados.
- `public/`: manifesto, ícones e recursos públicos do PWA.
- `.github/workflows/`: validação e publicação automatizadas.

## Publicação

O workflow de publicação está em `.github/workflows/deploy.yml` e publica a versão de produção no GitHub Pages após alterações na branch `main`. A validação automatizada está em `.github/workflows/validate.yml`.
