# PWA — Escala de Trabalho

O projeto contém configuração de Progressive Web App (PWA), incluindo manifesto, ícones e Service Worker. Isso permite oferecer instalação pelo navegador e preparar os recursos necessários para uso offline.

## Instalação

A instalação depende do navegador e do dispositivo. Em geral:

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

## Dados e funcionamento offline

- Os dados do aplicativo são armazenados localmente no navegador.
- Não existe sincronização automática com servidor ou entre dispositivos.
- A instalação do PWA não substitui a exportação de dados nem os backups.
- O uso offline depende de o Service Worker ter sido instalado e de os recursos necessários terem sido armazenados em cache após o acesso online.

**Limitação conhecida:** a configuração do PWA e o registro do Service Worker estão passando por uma revisão técnica. Até essa revisão ser concluída e testada, não conte com o funcionamento offline como única forma de acesso aos seus dados.

## Proteção dos dados

Antes de limpar os dados do navegador, trocar de dispositivo ou reinstalar o aplicativo, faça uma exportação ou confirme que possui um backup válido. Limpar os dados do site pode remover informações armazenadas localmente.

## Solução de problemas

Se a instalação ou a abertura do aplicativo apresentar problemas:

1. Confirme que está usando uma versão atualizada do navegador.
2. Abra o aplicativo com conexão à internet.
3. Verifique se há uma atualização disponível e tente abrir novamente.
4. Evite limpar os dados do site antes de exportar ou proteger suas informações.

