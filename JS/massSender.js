const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client();

// Lista de contatos
const contatos = [
    '554498601878@c.us',
    '@c.us',
    '@c.us'
];

// Mensagem que será enviada
const mensagem = `Olá! Me chamo Gabriel e sou representante comercial da Eurotextil 🧵
Trabalhamos com tecidos e malhas de alta qualidade voltados para moda casual, festa, sportswear, decoração e linha home.
A Eurotextil atua no mercado brasileiro desde 2002, com foco em agilidade nas entregas, variedade de produtos e preço justo. Nosso portfólio inclui tecidos em algodão, poliéster, viscose, elastano e outras fibras — sempre alinhados às últimas tendências.
Se tiver interesse, posso te apresentar nosso catálogo ou enviar sugestões de artigos que atendam às suas necessidades. Será um prazer te atender! 💬

Se quiser, posso ajustar esse texto para incluir emojis mais visuais, opções de resposta rápidas ou integração com seu bot. Quer que eu monte uma versão com botões interativos para facilitar o engajamento? 😄
\n`;

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Conectado. Iniciando envios em massa...');

    for (let numero of contatos) {
        try {
            await client.sendMessage(numero, mensagem);
            console.log(`✅ Mensagem enviada para: ${numero}`);
            await delay(30000); // delay entre envios para evitar spam
        } catch (err) {
            console.error(`❌ Erro ao enviar para ${numero}:`, err.message);
        }
    }

    console.log('📨 Envios concluídos!');
});

client.initialize();