const express = require('express');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { send2FACode } = require('./email');
const { generate2FACode, hashCode, verifyCode } = require('./2fa');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^http:\/\/localhost:\d+$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'sei_session_secret_dev_only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde alguns minutos.' }
});

const resendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas solicitacoes de reenvio. Aguarde 1 minuto.' }
});

app.post('/register', async (req, res) => {
  try {
    const nome = String(req.body.username || req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.password || req.body.senha || '');

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Preencha nome, email e senha.' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Este email ja esta cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.createUser(nome, email, senhaHash);

    return res.json({ success: true });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar usuario.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '').trim();

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe email e senha.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user || !(await db.verifyPassword(senha, user.senha_hash))) {
      return res.status(401).json({ erro: 'Credenciais invalidas.' });
    }

    const code = generate2FACode();
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.save2FACode(user.id, codeHash, expiresAt);
    await send2FACode(user.email, code);

    req.session.tempUserId = user.id;
    req.session.twofaPending = true;

    await db.logAuth(user.id, '2FA_CODE_SENT');

    return res.json({ redirect: '/pages/2fa.html' });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ erro: 'Erro ao iniciar autenticacao 2FA.' });
  }
});

app.post('/2fa/verify', verifyLimiter, async (req, res) => {
  try {
    const code = String(req.body.code || '').replace(/\D/g, '').slice(0, 6);
    const userId = req.session.tempUserId;

    if (!userId || !req.session.twofaPending) {
      return res.status(401).json({ erro: 'Sessao temporaria expirada.' });
    }

    const twofa = await db.get2FAByUserId(userId);
    if (!twofa || twofa.used || new Date() > new Date(twofa.expires_at)) {
      await db.logAuth(userId, '2FA_EXPIRED_OR_USED');
      return res.status(401).json({ erro: 'Codigo expirado ou ja utilizado.' });
    }

    if (twofa.attempts >= 5) {
      await db.logAuth(userId, '2FA_BLOCKED_ATTEMPTS');
      return res.status(429).json({ erro: 'Muitas tentativas invalidas. Aguarde.' });
    }

    const valid = await verifyCode(code, twofa.code_hash);
    if (!valid) {
      await db.increment2FAAttempts(twofa.id);
      await db.logAuth(userId, '2FA_INVALID_CODE');
      return res.status(401).json({ erro: 'Codigo incorreto.' });
    }

    await db.mark2FAUsed(twofa.id);

    req.session.userId = userId;
    req.session.twofaPending = false;
    delete req.session.tempUserId;

    await db.logAuth(userId, '2FA_SUCCESS');

    return res.json({ redirect: '/pages/dashboard.html' });
  } catch {
    return res.status(500).json({ erro: 'Erro ao validar codigo 2FA.' });
  }
});

app.post('/2fa/resend', resendLimiter, async (req, res) => {
  try {
    const userId = req.session.tempUserId;
    if (!userId || !req.session.twofaPending) {
      return res.status(401).json({ erro: 'Sessao temporaria expirada.' });
    }

    const twofa = await db.get2FAByUserId(userId);
    if (twofa && new Date() - new Date(twofa.last_sent) < 60 * 1000) {
      return res.status(429).json({ erro: 'Aguarde 60 segundos para reenviar.' });
    }

    const email = await db.getUserEmail(userId);
    const code = generate2FACode();
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.save2FACode(userId, codeHash, expiresAt, true);
    await send2FACode(email, code);
    await db.logAuth(userId, '2FA_RESENT');

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ erro: 'Erro ao reenviar codigo.' });
  }
});

function require2FA(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/pages/login.html');
  }
  return next();
}

app.get('/main', require2FA, (_req, res) => {
  return res.redirect('/pages/dashboard.html');
});

app.use(express.static(path.join(__dirname, '..')));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
