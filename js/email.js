const nodemailer = require('nodemailer');
require('dotenv').config({ quiet: true });

const emailUser = String(process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const emailPass = String(process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
const fromAddress = String(process.env.SMTP_FROM || emailUser || '').trim();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() !== 'false',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

async function send2FACode(email, code) {
  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER/EMAIL_PASS nao configurados. Defina a senha de app do Gmail no .env.');
  }

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Seu código de autenticação (SEI)',
    html: `<div style="font-family:sans-serif;background:#181c24;color:#fff;padding:24px;border-radius:8px;">
      <h2 style="color:#4fc3f7;">Código de autenticação</h2>
      <p>Seu código é:</p>
      <div style="font-size:2em;letter-spacing:8px;background:#222;padding:16px 0;border-radius:6px;text-align:center;color:#4fc3f7;">
        <b>${code}</b>
      </div>
      <p>O código expira em 5 minutos.</p>
    </div>`
  });
}

module.exports = { send2FACode };
