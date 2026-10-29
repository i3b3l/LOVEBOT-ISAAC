// ============================================================
// FEITO COM <3 POR IZABEL GALVAO :3
// ATUALIZACOES NO MEU GITHUB: https://github.com/i3b3l
// ============================================================

require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const {
    responderComIA,
    resetarConversaIA,
    registrarMensagemIzabel,
} = require('./src/ia');

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const NUMERO_NAMORADO = process.env.NAMORADO_NUMERO;
const NAMORADO_ID = process.env.NAMORADO_ID;

// Remove espaços, barras, aspas e padroniza o ID do WhatsApp
function normalizarIdWhatsApp(valor = '') {
    return String(valor)
        .replace(/\\/g, '')
        .replace(/["']/g, '')
        .replace(/\s+/g, '')
        .trim()
        .toLowerCase();
}

// Mantém somente números
function somenteNumeros(valor = '') {
    return String(valor).replace(/\D/g, '');
}

const numeroNamoradoLimpo = somenteNumeros(NUMERO_NAMORADO);
const namoradoIdLimpo = normalizarIdWhatsApp(NAMORADO_ID);

if (!numeroNamoradoLimpo && !namoradoIdLimpo) {
    console.error('');
    console.error('❌ ERRO DE CONFIGURAÇÃO');
    console.error('Nenhum namorado foi configurado no arquivo .env.');
    console.error('');
    console.error('Configure pelo menos uma destas opções:');
    console.error('NAMORADO_NUMERO=55XXXXXXXXXXX');
    console.error('NAMORADO_ID=XXXXXXXXXXXX@lid');
    console.error('');

    process.exit(1);
}

// IDs que serão aceitos
const IDS_AUTORIZADOS = new Set();

// Formato tradicional do WhatsApp
if (numeroNamoradoLimpo) {
    IDS_AUTORIZADOS.add(
        normalizarIdWhatsApp(`${numeroNamoradoLimpo}@c.us`)
    );
}

// Formato novo LID
if (namoradoIdLimpo) {
    IDS_AUTORIZADOS.add(namoradoIdLimpo);
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

function normalizarTexto(valor = '') {
    return String(valor)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function respostaAleatoria(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function mascararId(id = '') {
    const valor = normalizarIdWhatsApp(id);

    const [identificador, dominio] = valor.split('@');

    if (!identificador) {
        return valor;
    }

    if (identificador.length <= 6) {
        return `***@${dominio || '?'}`;
    }

    return `${identificador.slice(0, 3)}***${identificador.slice(-3)}@${dominio || '?'}`;
}

// =====================================================
// CONTROLE DE MENSAGENS ENVIADAS PELO PRÓPRIO LOVEBOT
// =====================================================

// O evento "message_create" também enxerga mensagens enviadas
// automaticamente pelo bot. Este controle impede que essas respostas
// sejam registradas como se fossem mensagens manuais da Izabel.
const RESPOSTA_AUTOMATICA_TTL_MS = 15000;
const respostasAutomaticasPendentes = new Map();

function chaveRespostaAutomatica(texto = '') {
    return String(texto).trim();
}

function limparRespostasAutomaticasExpiradas() {
    const limite = Date.now() - RESPOSTA_AUTOMATICA_TTL_MS;

    for (const [chave, horarios] of respostasAutomaticasPendentes.entries()) {
        const validos = horarios.filter((horario) => horario >= limite);

        if (validos.length === 0) {
            respostasAutomaticasPendentes.delete(chave);
        } else {
            respostasAutomaticasPendentes.set(chave, validos);
        }
    }
}

function marcarRespostaAutomatica(texto) {
    limparRespostasAutomaticasExpiradas();

    const chave = chaveRespostaAutomatica(texto);
    const horarios = respostasAutomaticasPendentes.get(chave) || [];

    horarios.push(Date.now());
    respostasAutomaticasPendentes.set(chave, horarios);
}

function cancelarRespostaAutomatica(texto) {
    const chave = chaveRespostaAutomatica(texto);
    const horarios = respostasAutomaticasPendentes.get(chave);

    if (!horarios?.length) {
        return;
    }

    horarios.pop();

    if (horarios.length === 0) {
        respostasAutomaticasPendentes.delete(chave);
    } else {
        respostasAutomaticasPendentes.set(chave, horarios);
    }
}

function consumirSeForRespostaAutomatica(texto) {
    limparRespostasAutomaticasExpiradas();

    const chave = chaveRespostaAutomatica(texto);
    const horarios = respostasAutomaticasPendentes.get(chave);

    if (!horarios?.length) {
        return false;
    }

    horarios.shift();

    if (horarios.length === 0) {
        respostasAutomaticasPendentes.delete(chave);
    } else {
        respostasAutomaticasPendentes.set(chave, horarios);
    }

    return true;
}

// =====================================================
// RESPOSTAS DO LOVEBOT ❤️
// =====================================================

const respostas = {
    amor: [
        'Oi, amor da minha vida ❤️',
        'Chamou? 👀❤️',
        'Diga, meu bem 😌',
        'Sim, senhor namorado? 😂❤️',
        'Tava pensando em você agora 🥰',
    ],

    teAmo: [
        'Eu te amo mais ❤️',
        'Também te amo, meu amor 🥹❤️',
        'Muito mais do que você imagina ❤️',
        'Te amo infinito e mais um pouco 😌❤️',
    ],

    saudade: [
        'Eu também tô com saudade 🥺❤️',
        'Nem fala... vem aqui logo 😭❤️',
        'Saudade detectada com sucesso. Solução: me ver imediatamente 😂❤️',
    ],

    beijo: [
        'Beijoooo 😘😘😘',
        'Um só? Toma vários 😘😘😘😘',
        '💋❤️',
    ],

    bomDia: [
        'Bom dia, meu amor ☀️❤️',
        'Bom diaaa, meu lindo 🥰☀️',
        'Bom dia! Já falei que te amo hoje? ❤️',
    ],

    boaNoite: [
        'Boa noite, meu amor 🌙❤️',
        'Dorme bem e sonha comigo 😌❤️',
        'Boa noiteee 🥰🌙 Te amo!',
    ],

    brava: [
        'Depende... o que você fez? 🤨',
        'Por que a pergunta? 👀😂',
        'Meu sistema detectou comportamento suspeito 🤨😂❤️',
    ],

    comida: [
        'Você falou COMIDA? Agora tem minha atenção 😂',
        'Aceito lanche como demonstração oficial de amor 😌🍔❤️',
        'Se tiver comida envolvida, eu apoio 😂❤️',
    ],

    presente: [
        'Presente? 👀 Estou ouvindo...',
        'Continue... você tem toda a minha atenção agora 👀🎁',
        'Meu sistema aprovou essa palavra 😂🎁❤️',
    ],

    chegou: [
        'Finalmente apareceu 😂❤️',
        'Chegouuu 🥰❤️',
        'Muito bem. Agora pode vir me dar atenção 😌❤️',
    ],

    desculpa: [
        'Hmmmm... vou analisar seu pedido de desculpas 🤨😂❤️',
        'Pedido recebido. Prazo de análise: depende do tamanho do vacilo 😂',
        'Tá perdoado... talvez 👀❤️',
    ],
};

// =====================================================
// CLIENTE WHATSAPP
// =====================================================

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'lovebot',
    }),
});

// =====================================================
// EVENTOS DO WHATSAPP
// =====================================================

client.on('qr', (qr) => {
    console.log('');
    console.log('📱 Escaneie o QR Code abaixo com o WhatsApp:');
    console.log('');

    qrcode.generate(qr, {
        small: true,
    });
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp autenticado com sucesso.');
});

client.on('auth_failure', (mensagem) => {
    console.error('');
    console.error('❌ Falha na autenticação do WhatsApp:');
    console.error(mensagem);
    console.error('');
});

client.on('ready', () => {
    console.log('');
    console.log('==============================================');
    console.log('❤️ LOVEBOT CONECTADO E PRONTO!');
    console.log('==============================================');
    console.log('');
    console.log('💌 Aguardando mensagens do namorado...');
    console.log(`🔐 ${IDS_AUTORIZADOS.size} identificador(es) autorizado(s).`);
    console.log('');
});

client.on('disconnected', (motivo) => {
    console.log('');
    console.log('⚠️ WhatsApp desconectado.');
    console.log('Motivo:', motivo);
    console.log('');
});

// =====================================================
// ENVIO DE RESPOSTAS
// =====================================================

async function responder(msg, resposta) {
    await delay(700);

    const textoResposta = String(resposta || '').trim();

    if (!textoResposta) {
        console.log('⚠️ Resposta vazia ignorada.');
        return;
    }

    // Marca ANTES do envio para o message_create não interpretar
    // uma resposta automática como uma mensagem manual da Izabel.
    marcarRespostaAutomatica(textoResposta);

    try {
        await client.sendMessage(
            msg.from,
            textoResposta
        );
    } catch (erro) {
        cancelarRespostaAutomatica(textoResposta);
        throw erro;
    }

    console.log('💌 Resposta enviada.');
}

// =====================================================
// VERIFICAÇÃO DO NAMORADO
// =====================================================

function ehNamorado(msg) {
    const remetente = normalizarIdWhatsApp(msg.from);

    return IDS_AUTORIZADOS.has(remetente);
}

// =====================================================
// MENSAGENS MANUAIS DA IZABEL -> CONTEXTO DA IA
// =====================================================

// "message_create" recebe também mensagens enviadas pela conta conectada.
// Aqui só observamos mensagens MANUAIS da Izabel enviadas para Isaac.
// Nenhuma resposta é disparada por este evento.
client.on('message_create', async (msg) => {
    try {
        if (!msg.fromMe) {
            return;
        }

        const destino = normalizarIdWhatsApp(msg.to);

        // Só interessa conversa privada com Isaac.
        if (!IDS_AUTORIZADOS.has(destino)) {
            return;
        }

        const texto = String(msg.body || '').trim();

        if (!texto) {
            return;
        }

        // Se foi o próprio LoveBot que acabou de enviar, ignora.
        if (consumirSeForRespostaAutomatica(texto)) {
            console.log('🤖 Resposta automática não adicionada ao contexto da Izabel.');
            return;
        }

        registrarMensagemIzabel(texto);

        console.log('🧠 Mensagem manual da Izabel adicionada ao contexto.');
    } catch (erro) {
        console.error('');
        console.error('❌ Erro ao registrar mensagem manual da Izabel:');
        console.error(erro);
        console.error('');
    }
});

// =====================================================
// PROCESSAMENTO DAS MENSAGENS
// =====================================================

client.on('message', async (msg) => {
    try {
        const remetente = normalizarIdWhatsApp(msg.from);

        // -------------------------------------------------
        // IGNORA MENSAGENS ENVIADAS PELA PRÓPRIA CONTA
        // -------------------------------------------------

        if (msg.fromMe) {
            return;
        }

        // -------------------------------------------------
        // IGNORA GRUPOS
        // -------------------------------------------------

        if (remetente.endsWith('@g.us')) {
            return;
        }

        // -------------------------------------------------
        // IGNORA STATUS
        // -------------------------------------------------

        if (remetente === 'status@broadcast') {
            return;
        }

        // -------------------------------------------------
        // IGNORA NEWSLETTERS / BROADCASTS
        // -------------------------------------------------

        if (
            remetente.endsWith('@broadcast') ||
            remetente.endsWith('@newsletter')
        ) {
            return;
        }

        // -------------------------------------------------
        // FILTRO PRINCIPAL
        // -------------------------------------------------

        if (!ehNamorado(msg)) {
            console.log(
                `🚫 Mensagem ignorada de: ${mascararId(remetente)}`
            );

            return;
        }

        // -------------------------------------------------
        // NAMORADO RECONHECIDO ❤️
        // -------------------------------------------------

        console.log('');
        console.log('==============================================');
        console.log('❤️ MENSAGEM RECEBIDA DO NAMORADO!');
        console.log('==============================================');

        const textoOriginal = msg.body || '';
        const texto = normalizarTexto(textoOriginal);

        console.log('💬 Mensagem:', textoOriginal);
        console.log('🔎 Interpretado:', texto);
        console.log('');

        if (!texto) {
            return;
        }

        // =================================================
        // EU TE AMO MAIS
        // Deve ficar ANTES da regra "te amo".
        // =================================================

        if (
            texto.includes('eu te amo mais') ||
            texto.includes('te amo mais')
        ) {
            await responder(
                msg,
                '❌ COMANDO INVÁLIDO.\n\nIzabel te ama mais.\nEssa informação não pode ser alterada. 😂❤️'
            );

            return;
        }

        // =================================================
        // AMOR
        // =================================================

        if (
            texto === 'amor' ||
            texto === 'meu amor' ||
            /^amo+r+$/.test(texto) ||
            /^amo+r+ meu amor$/.test(texto)
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.amor)
            );

            return;
        }

        // =================================================
        // TE AMO
        // =================================================

        if (
            texto.includes('te amo') ||
            texto.includes('amo voce')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.teAmo)
            );

            return;
        }

        // =================================================
        // SAUDADE
        // =================================================

        if (
            texto.includes('saudade') ||
            texto.includes('saudades')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.saudade)
            );

            return;
        }

        // =================================================
        // BEIJO
        // =================================================

        if (
            texto.includes('beijo') ||
            texto.includes('beijinho') ||
            texto.includes('beijao')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.beijo)
            );

            return;
        }

        // =================================================
        // BOM DIA
        // =================================================

        if (texto.includes('bom dia')) {
            await responder(
                msg,
                respostaAleatoria(respostas.bomDia)
            );

            return;
        }

        // =================================================
        // BOA NOITE
        // =================================================

        if (texto.includes('boa noite')) {
            await responder(
                msg,
                respostaAleatoria(respostas.boaNoite)
            );

            return;
        }

        // =================================================
        // BRAVA?
        // =================================================

        if (
            texto.includes('brava') ||
            texto.includes('ta brava') ||
            texto.includes('esta brava')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.brava)
            );

            return;
        }

        // =================================================
        // COMIDA
        // =================================================

        if (
            texto.includes('comida') ||
            texto.includes('lanche') ||
            texto.includes('fome')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.comida)
            );

            return;
        }

        // =================================================
        // PRESENTE
        // =================================================

        if (
            texto.includes('presente') ||
            texto.includes('presente pra voce')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.presente)
            );

            return;
        }

        // =================================================
        // CHEGUEI
        // =================================================

        if (
            texto.includes('cheguei') ||
            texto.includes('to chegando') ||
            texto.includes('estou chegando')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.chegou)
            );

            return;
        }

        // =================================================
        // DESCULPA
        // =================================================

        if (
            texto.includes('desculpa') ||
            texto.includes('me perdoa') ||
            texto.includes('foi mal')
        ) {
            await responder(
                msg,
                respostaAleatoria(respostas.desculpa)
            );

            return;
        }

        // =================================================
        // NENHUM COMANDO
        // =================================================

        console.log('🧠 Nenhuma regra fixa reconheceu a mensagem.');
console.log('🤖 Enviando para a IA...');

try {
    const respostaIA = await responderComIA(textoOriginal);

    await responder(
        msg,
        respostaIA
    );

    console.log('🤖 IA respondeu com sucesso.');

} catch (erroIA) {

    console.error('❌ Erro ao consultar a IA:');
    console.error(erroIA);

    await responder(
        msg,
        'Meu cérebro artificial deu uma travadinha 😂❤️ Tenta de novo daqui a pouco.'
    );
}

    } catch (erro) {
        console.error('');
        console.error('❌ Erro ao processar mensagem no LoveBot:');
        console.error(erro);
        console.error('');
    }
});

// =====================================================
// TRATAMENTO DE ERROS DO NODE
// =====================================================

process.on('unhandledRejection', (erro) => {
    console.error('');
    console.error('❌ Promise rejeitada sem tratamento:');
    console.error(erro);
    console.error('');
});

process.on('uncaughtException', (erro) => {
    console.error('');
    console.error('❌ Erro inesperado no Node.js:');
    console.error(erro);
    console.error('');
});

// =====================================================
// ENCERRAMENTO CORRETO
// =====================================================

async function encerrarBot() {
    console.log('');
    console.log('🛑 Encerrando LoveBot...');

    try {
        await client.destroy();
    } catch {
        // Ignora erro durante encerramento
    }

    process.exit(0);
}

process.on('SIGINT', encerrarBot);
process.on('SIGTERM', encerrarBot);

// =====================================================
// INICIALIZAÇÃO
// =====================================================

console.log('');
console.log('==============================================');
console.log('❤️            INICIANDO LOVEBOT');
console.log('==============================================');
console.log('');

client.initialize().catch((erro) => {
    console.error('');
    console.error('❌ Não foi possível iniciar o LoveBot:');
    console.error(erro);
    console.error('');
});
