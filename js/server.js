const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const publicRoot = path.join(__dirname, '..');

function sendPage(res, relativePath) {
  return res.sendFile(path.join(publicRoot, relativePath));
}

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

    req.session.userId = user.id;
    await db.logAuth(user.id, 'LOGIN_SUCCESS');
    return res.json({ redirect: '/dashboard' });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ erro: 'Erro ao realizar login.' });
  }
});

app.get('/main', (_req, res) => {
  return res.redirect('/pages/main.html');
});

app.get('/', (_req, res) => sendPage(res, 'index.html'));
app.get('/dashboard', (_req, res) => sendPage(res, 'pages/dashboard.html'));
app.get('/modules', (_req, res) => sendPage(res, 'pages/modules.html'));
app.get('/module/:id', (_req, res) => sendPage(res, 'pages/module.html'));
app.get('/lesson/:id', (_req, res) => sendPage(res, 'pages/lesson.html'));
app.get('/quiz/:id', (_req, res) => sendPage(res, 'pages/quiz.html'));
app.get('/simulator', (_req, res) => sendPage(res, 'pages/simulator.html'));
app.get('/glossary', (_req, res) => sendPage(res, 'pages/glossary.html'));
app.get('/ai-tutor', (_req, res) => sendPage(res, 'pages/tutor.html'));
app.get('/profile', (_req, res) => sendPage(res, 'pages/profile.html'));

app.use(express.static(publicRoot));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
