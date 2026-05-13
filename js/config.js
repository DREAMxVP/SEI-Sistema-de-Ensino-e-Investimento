// CONFIGURE AQUI SEU SERVIDOR SMTP PARA ENVIO DE EMAILS 2FA
// Exemplo para Gmail: host: 'smtp.gmail.com', port: 465, secure: true
// Exemplo para Outlook: host: 'smtp.office365.com', port: 587, secure: false
// Para Gmail, pode ser necessário criar uma senha de app.

module.exports = {
  smtp: {
    host: 'smtp.seuservidor.com', // HOST SMTP (ex: smtp.gmail.com)
    port: 587,                    // PORTA SMTP (ex: 465 para SSL, 587 para TLS)
    secure: false,                // true para 465 (SSL), false para 587 (TLS)
    auth: {
      user: 'seu@email.com',      // EMAIL SMTP (remetente)
      pass: 'sua_senha'           // SENHA SMTP (ou senha de app)
    }
  }
};
