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

## Instalação como aplicativo (PWA)

O projeto inclui configuração de Progressive Web App (PWA), com manifesto, ícones e recursos para instalação pelo navegador. A instalação depende do navegador e do dispositivo.

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

- A instalação do PWA não substitui a exportação de dados nem os backups.
- O uso offline depende de o Service Worker ter sido instalado e de os recursos necessários terem sido armazenados em cache após o acesso online.
- Os dados continuam armazenados localmente no navegador; não existe sincronização automática com servidor ou entre dispositivos.

**Limitação conhecida:** a configuração do PWA e o registro do Service Worker estão passando por uma revisão técnica. Até essa revisão ser concluída e testada, não conte com o funcionamento offline como única forma de acesso aos seus dados.

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

## Publicação

O workflow de publicação está em `.github/workflows/deploy.yml` e publica a versão de produção no GitHub Pages após alterações na branch `main`. A validação automatizada está em `.github/workflows/validate.yml`.
