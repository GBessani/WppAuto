// pdfSender.js
require('dotenv').config(); 
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const USER = process.env.PORTAL_USER;
const PASS = process.env.PORTAL_PASS;
const OUTPUT_DIR = process.env.PDF_OUTPUT_DIR;


if (!USER || !PASS) {
  throw new Error('❌ PORTAL_USER ou PORTAL_PASS não definidos no .env');
}
if (!OUTPUT_DIR) {
  throw new Error('❌ PDF_OUTPUT_DIR não definido no .env');
}

async function gerarRelatorioPDF(item = 'helanka') {
  
  //Bloco de codigo que faz login
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://portal.eurotextil.com.br');

  await page.waitForSelector('input[placeholder="Usuário"]');
  await page.type('input[placeholder="Usuário"]', USER); //Usuario
  await page.type('input[placeholder="Senha"]', PASS); //Senha
  await page.click('.mat-raised-button.mat-button-base.mat-primary');
  await page.waitForNavigation();
  //Fim do bloco

  //Bloco de codigo que pequisa o Artigo
  await page.goto('https://portal.eurotextil.com.br/#/galeria-imagens');
  await new Promise(resolve => setTimeout(resolve, 2500));
  await page.type('input[placeholder="Item Relatorio"]', item);
  await page.waitForFunction(
    (itemName) => {
      const el = document.querySelector('.mat-option-text');
      return el && el.textContent.toLowerCase().includes(itemName.toLowerCase());
    },
    { timeout: 20000 },
    item
  );
  await page.evaluate((itemName) => {
    const lista = Array.from(document.querySelectorAll('.mat-option-text'));
    const itemSelecionado = lista.find(el => el.textContent.toLowerCase().includes(itemName.toLowerCase()));
    if (itemSelecionado) itemSelecionado.click();
  }, item);
  await page.waitForFunction(() => {
    return document.querySelector('.mat-raised-button.mat-button-base.mat-primary');
  }, { timeout: 10000 });
  let pdfBuffer = null;
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  //Fim do bloco

  //Bloco de codigo que recebe o url da pagina de pdf
  const [pdfPage] = await Promise.all([
    new Promise(resolve =>
      browser.once('targetcreated', async target => {
        const newPage = await target.page();
        await newPage.bringToFront();
        newPage.on('response', async response => {
          const headers = response.headers();
          if (headers['content-type']?.includes('application/pdf')) {
            pdfBuffer = await response.buffer();
          }
        });
        resolve(newPage);
      })
    ),
    page.click('.mat-raised-button.mat-button-base.mat-primary')
  ]);
  //Fim do bloco

  await new Promise(resolve => setTimeout(resolve, 3000));

  //Bloco de codigo que baixa o PDF
  let filePath;
  if (pdfBuffer) {
    const safeItemName = item.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `relatorio-${safeItemName}-${Date.now()}.pdf`;
    filePath = path.resolve(OUTPUT_DIR, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    console.log('📥 PDF capturado e salvo com sucesso:', filePath);

  } else {
    console.log('⚠️ PDF não foi detectado.');
  }
  //Fim do bloco

  //Bloco de log e finalização
  await page.$eval('input[placeholder="Item Relatorio"]', el => el.value = '');
  await browser.close();
  console.log('🏁 Processo finalizado com sucesso');
  return filePath || null;
  //fim do bloco
}

module.exports = { gerarRelatorioPDF };
