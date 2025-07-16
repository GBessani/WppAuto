import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';

const logFile = path.resolve('./data/contatos.json');

const saveContact = async (msg, tipo) => {
  const contact = await msg.getContact();

  const entry = {
    nome: contact.pushname || 'Desconhecido',
    numero: msg.from,
    mensagem: msg.body,
    tipo,
    horario: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss')
  };

  let logs = [];
  if (fs.existsSync(logFile)) {
    const raw = fs.readFileSync(logFile, 'utf-8');
    logs = raw.trim() ? JSON.parse(raw) : [];
  }

  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
};

export default saveContact;
