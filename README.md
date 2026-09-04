# Bot WhatsApp — RAIO, ICNG e HKW

Bot de atendimento para WhatsApp feito com Node.js e `whatsapp-web.js`.

## Estrutura

- `bot_whatsapp_lojas.js` — código principal do bot.
- `INSTALAR_DEPENDENCIAS.bat` — instala as dependências no Windows.
- `INICIAR_BOT.bat` — inicia o bot no Windows.
- `package.json` — configura o projeto e as dependências.
- `package-lock.json` — fixa as versões instaladas.
- `.gitignore` — impede arquivos locais/sensíveis de irem para o GitHub.
- `tests/smoke_test.js` — teste rápido da lógica de mensagens, sem conectar ao WhatsApp.

## Requisitos

- Node.js 18 ou superior.
- Internet na primeira instalação.
- WhatsApp no celular para escanear o QR Code.

## Instalação no Windows

1. Execute `INSTALAR_DEPENDENCIAS.bat`.
2. Depois execute `INICIAR_BOT.bat`.
3. Na primeira execução, escaneie o QR Code exibido no terminal.

A sessão será salva localmente em `.wwebjs_auth/`. Essa pasta está no `.gitignore` e não deve ser enviada ao GitHub.

## Pelo terminal

```bash
npm install
npm start
```

Para validar a lógica sem conectar ao WhatsApp:

```bash
npm test
```

## Mensagens reconhecidas

- RAIO: parte de cima, parte de baixo, corpo todo, acessórios e best sellers/coleção completa.
- ICNG: boca, olhos, rosto, cabelo e best sellers/coleção completa.
- HKW: moda e acessórios, beleza e cosméticos, casa e decoração e best sellers/coleção completa.

Para as categorias, inclua também o nome da loja na mensagem, por exemplo: `RAIO parte de cima` ou `HKW moda e acessórios`.
