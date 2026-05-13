const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');


// CONFIGURAÇÃO LOCAL PARA EXTENSÃO MYSQL DO VS CODE:
// 1. Certifique-se que o MySQL está rodando localmente (localhost:3306).
// 2. Usuário padrão: root | Senha: (em branco ou sua senha local)
// 3. Banco de dados: sei
// 4. Se usar senha diferente, altere abaixo:
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Altere se necessário
  password: 'root', // Altere se necessário
  database: 'sei',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Usuário
async function createUser(nome, email, senhaHash) {
  await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash, created_at) VALUES (?, ?, ?, NOW())',
    [nome, email, senhaHash]
  );
}

async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 2FA
async function save2FACode(userId, code_hash, expires_at) {
  const [result] = await pool.query(
    'UPDATE auth_2fa SET code_hash=?, expires_at=?, used=0, attempts=0, last_sent=NOW() WHERE user_id=?',
    [code_hash, expires_at, userId]
  );
  if (result.affectedRows === 0) {
    await pool.query(
      'INSERT INTO auth_2fa (user_id, code_hash, expires_at, used, attempts, last_sent) VALUES (?, ?, ?, 0, 0, NOW())',
      [userId, code_hash, expires_at]
    );
  }
}

async function get2FAByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM auth_2fa WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
  return rows[0];
}

async function increment2FAAttempts(id) {
  await pool.query('UPDATE auth_2fa SET attempts = attempts + 1 WHERE id = ?', [id]);
}

async function mark2FAUsed(id) {
  await pool.query('UPDATE auth_2fa SET used = 1 WHERE id = ?', [id]);
}

async function getUserEmail(userId) {
  const [rows] = await pool.query('SELECT email FROM usuarios WHERE id = ?', [userId]);
  return rows[0]?.email;
}

// Logs
async function logAuth(userId, status) {
  await pool.query('INSERT INTO auth_logs (user_id, status, created_at) VALUES (?, ?, NOW())', [userId, status]);
}

module.exports = {
  createUser,
  getUserByEmail,
  verifyPassword,
  save2FACode,
  get2FAByUserId,
  increment2FAAttempts,
  mark2FAUsed,
  getUserEmail,
  logAuth
};
