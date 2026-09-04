const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, '..', 'bot_whatsapp_lojas.js'), 'utf8');

class FakeClient {
    constructor() {
        this.handlers = {};
        this.sent = [];
    }

    on(event, handler) {
        this.handlers[event] = handler;
    }

    async sendMessage(to, body) {
        this.sent.push({ to, body });
    }

    async initialize() {}
}

const fakeClient = new FakeClient();

const sandbox = {
    console,
    Promise,
    setTimeout: (fn) => {
        fn();
        return 0;
    },
    require: (name) => {
        if (name === 'whatsapp-web.js') {
            return {
                Client: class {
                    constructor() {
                        return fakeClient;
                    }
                },
                LocalAuth: class {},
            };
        }

        if (name === 'qrcode-terminal') {
            return { generate() {} };
        }

        throw new Error(`Módulo inesperado no teste: ${name}`);
    },
};

vm.runInNewContext(source, sandbox, { filename: 'bot_whatsapp_lojas.js' });

async function enviarMensagem(body) {
    fakeClient.sent.length = 0;
    const replies = [];
    const chat = {
        async sendStateTyping() {},
    };
    const msg = {
        from: '5511999999999@c.us',
        body,
        async getChat() {
            return chat;
        },
        async reply(text) {
            replies.push(text);
        },
    };

    await fakeClient.handlers.message(msg);
    return { sent: [...fakeClient.sent], replies };
}

(async () => {
    let result = await enviarMensagem('Olá');
    assert.strictEqual(result.replies.length, 1, 'Saudação deve receber resposta.');

    result = await enviarMensagem('RAIO parte de cima');
    assert.strictEqual(result.sent.length, 2, 'RAIO parte de cima deve enviar duas mensagens.');
    assert.match(result.sent[0].body, /Parte de Cima/);

    result = await enviarMensagem('ICNG cabelo');
    assert.strictEqual(result.sent.length, 2, 'ICNG cabelo deve enviar duas mensagens.');
    assert.match(result.sent[0].body, /Cabelo/);

    result = await enviarMensagem('HKW moda e acessórios');
    assert.strictEqual(result.sent.length, 2, 'HKW moda e acessórios deve enviar duas mensagens.');
    assert.match(result.sent[0].body, /Moda e Acessórios/);

    result = await enviarMensagem('moda e acessórios');
    assert.strictEqual(result.sent.length, 0, 'HKW não deve responder sem a palavra HKW.');

    result = await enviarMensagem('HKW coleção completa');
    assert.strictEqual(result.sent.length, 2, 'HKW coleção completa deve enviar duas mensagens.');

    console.log('✅ Smoke tests concluídos com sucesso.');
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
