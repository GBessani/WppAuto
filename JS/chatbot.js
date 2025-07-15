const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const { gerarRelatorioPDF } = require('./pdfSender'); // 🚀 sua função Puppeteer
const client = new Client();

const delay = ms => new Promise(res => setTimeout(res, ms));

const resfriamento = {};
const estadoUsuario = {}; // 👈 novo controle de estado

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Tudo certo! WhatsApp conectado.');
});

client.initialize();
    //Inicio do bloco de codigos do identificador de midias
    if (msg.hasMedia) {
        resfriamento[chatId] = true;
        setTimeout(() => {
            delete resfriamento[chatId];
            console.log(`✅ ${chatId} liberado para novo atendimento.`);
        }, 1800000);

        const media = await msg.downloadMedia();
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';

        const respostaMedia = media.mimetype.startsWith('image') ? '📷 Recebi sua imagem. Obrigado!'
                          : media.mimetype.startsWith('audio') ? '🎧 Recebi seu áudio. Obrigado!'
                          : '🗂️ Recebi sua mídia. Obrigado!';
        await client.sendMessage(chatId, respostaMedia);

        await delay(1500);
        await client.sendMessage(
            chatId,
            `Olá ${name.split(" ")[0]}! Sou o assistente virtual do Gabriel.\n\nDigite uma das opções abaixo:\n\n1 - 📄 Solicitar PDF de estoque\n2 - 💰 Solicitar valores\n3 - 📞 Falar diretamente com Gabriel`
        );
        return;
    }
    //Fim do bloco de codigos do identificador de midias


    //Inicio do bloco de codigos do menu
    if (/^(menu|dia|tarde|noite|oi|olá|ola)$/i.test(texto)) {
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';

        await delay(1500);
        await client.sendMessage(
            chatId,
            `Olá ${name.split(" ")[0]}! Sou o assistente virtual do Gabriel.\n\nDigite uma das opções abaixo:\n\n1 - 📄 Solicitar PDF de estoque\n2 - 💰 Solicitar valores\n3 - 📞 Falar diretamente com Gabriel`
        );

        resfriamento[chatId] = true;
        setTimeout(() => {
            delete resfriamento[chatId];
            console.log(`✅ ${chatId} liberado para novo atendimento.`);
        }, 1800000);
        return;
    }
    //Fim Do bloco de codigos do menu

    // ✅ OPÇÃO 1: Solicitar PDF
    if (texto === '1') {
        estadoUsuario[chatId] = 'aguardando_artigo';
        await delay(1500);
        await client.sendMessage(chatId, '📄 Por favor, digite o nome do artigo que deseja gerar como PDF:');
        return;
    }
    //Fim da opção 1

    //Inicio do bloco que chama o Gerador de PDF 
    client.on('message', async msg => {
        if (msg.fromMe) return;
        const chatId = msg.from;
        const texto = msg.body.trim();
        const fs = require('fs');

        // Estado aguardando artigo
        if (estadoUsuario[chatId] === 'aguardando_artigo') {
            estadoUsuario[chatId] = null;
            const artigo = texto;

            await client.sendMessage(chatId, `⏳ Gerando PDF para o artigo: *${artigo}*...`);

            try {
                const caminho = await gerarRelatorioPDF(artigo);
                if (caminho) {
                    await client.sendMessage(chatId, `✅ PDF gerado com sucesso!`);
                    // (opcional) Enviar como anexo:
                    const media = MessageMedia.fromFilePath(caminho);
                    await client.sendMessage(chatId, media);
                    // ⏱️ Aguarda 15 segundos e apaga o arquivo
                    setTimeout(() => {
                        fs.unlink(caminho, (err) => {
                            if (err) {
                            console.error('⚠️ Erro ao deletar o arquivo:', err.message);
                            } 
                            else {console.log(`🧹 Arquivo ${caminho} deletado após envio.`);}
                        });
                    }, 15000);                
            } 
            
            else {await client.sendMessage(chatId, `⚠️ O PDF não foi detectado para o artigo: *${artigo}*`);}
        } catch (error) {
            await client.sendMessage(chatId, `❌ Erro ao gerar o PDF: ${error.message}`);
        }
        return;
    }
    //Fim do bloco que chama o gerador De pdf
    
    // OPÇÃO 2
    if (texto === '2') {
        await delay(1500);
        await client.sendMessage(chatId, '💰 Por favor, digite os artigos para consulta de valores:\n-\n-\n-');
        return;
    }

    // OPÇÃO 3
    if (texto === '3') {
        await delay(1500);
        await client.sendMessage(chatId, '📞 Aguarde um momento… Gabriel será notificado!');
        return;
    }

    //Inicio do bloco de resfriamento
    if (resfriamento[chatId]) {
        if (!['1', '2', '3'].includes(texto)) {
            console.log(`⏳ ${chatId} está em resfriamento.`);
            return;
        }
    }
    //Fim do bloco de Resfriamento
});