# Robô WhatsApp — para o meu amor ❤️

Bot pessoal de WhatsApp que responde às mensagens privadas de um contato autorizado, combinando respostas rápidas predefinidas com uma IA configurável. O projeto também usa mensagens manuais recentes enviadas pela própria conta como contexto temporário para a IA, sem responder a essas mensagens.

## Funcionalidades

- Respostas predefinidas para mensagens comuns, como “amor”, “te amo”, saudade, bom dia e boa noite.
- Encaminhamento de mensagens não reconhecidas pelas regras fixas para a API da OpenAI.
- Restrição das respostas automáticas ao contato configurado no arquivo `.env`.
- Ignora mensagens enviadas pela própria conta, grupos, Status, newsletters e broadcasts.
- Usa mensagens manuais recentes enviadas pela Izabel ao contato autorizado como contexto temporário da IA.
- Mantém o contexto em memória; as mensagens manuais expiram após 20 minutos ou quando a conversa é reiniciada.
- Autenticação do WhatsApp via QR Code e sessão local com `whatsapp-web.js`.
- Inicialização e instalação simplificadas por arquivos `.bat` no Windows.

## Requisitos

- Windows 10/11 ou ambiente compatível com Node.js.
- Node.js 18 ou superior e npm.
- Conexão com a internet.
- WhatsApp para vincular a sessão por QR Code.
- Chave de API válida da OpenAI.

## Instalação no Windows

1. Baixe ou clone este repositório.
2. Execute `INSTALAR_DEPENDENCIAS.bat`.
3. Crie o arquivo `.env` na pasta do projeto usando `.env.example` como modelo.
4. Preencha as configurações descritas abaixo.
5. Execute `INICIAR_BOT.bat` e, na primeira execução, escaneie o QR Code com o WhatsApp.

## Configuração do `.env`

```dotenv
NAMORADO_NUMERO=55DDDNUMERO
NAMORADO_ID=IDENTIFICADOR_DO_CONTATO@lid
OPENAI_API_KEY=sua_chave_de_api
OPENAI_MODEL=modelo_disponivel_na_sua_conta
```

- `NAMORADO_NUMERO`: número do contato no formato internacional, somente dígitos, incluindo o código do país. Pode ser usado para autorizar o identificador tradicional `@c.us`.
- `NAMORADO_ID`: identificador do contato no formato LID, quando conhecido. É possível configurar o número, o LID ou ambos.
- `OPENAI_API_KEY`: chave privada da API da OpenAI.
- `OPENAI_MODEL`: modelo disponível para sua chave; se omitido, o código usa o modelo padrão definido em `src/ia.js`.

**Segurança:** não compartilhe nem publique o arquivo `.env`, a chave de API ou a pasta `.wwebjs_auth`. Esses itens são locais e estão excluídos do Git pelo `.gitignore`. O `.env.example` contém apenas valores ilustrativos.

## Como executar pelo terminal

```bash
npm install
npm start
```

Para verificar a sintaxe dos arquivos principais:

```bash
npm run check
node --check src/ia.js
```

## Arquivos principais

- `lovebot.js` — conexão com o WhatsApp, filtros de mensagens, respostas fixas e integração com a IA.
- `src/ia.js` — personalidade, contexto temporário e chamadas à API da OpenAI.
- `.env.example` — exemplo das variáveis necessárias, sem credenciais reais.
- `INICIAR_BOT.bat` — inicia o bot.
- `INSTALAR_DEPENDENCIAS.bat` — instala as dependências.
- `LEIA-ME.txt` — notas da versão sobre o contexto das mensagens manuais.
- `package.json` e `package-lock.json` — dependências e scripts do Node.js.

## Observações importantes

- O bot precisa permanecer em execução para responder automaticamente.
- A sessão do WhatsApp é armazenada localmente; proteja o computador e não compartilhe a pasta de autenticação.
- A API da OpenAI pode gerar custos conforme o uso e o modelo configurado.
- Respostas de IA podem conter erros. Revise o comportamento antes de depender dele em situações importantes.
- Este projeto utiliza `whatsapp-web.js`, uma integração não oficial com o WhatsApp. Mudanças no serviço podem afetar o funcionamento.
