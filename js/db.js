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

// Logs
async function logAuth(userId, status) {
  await pool.query('INSERT INTO auth_logs (user_id, status, created_at) VALUES (?, ?, NOW())', [userId, status]);
}

module.exports = {
  createUser,
  getUserByEmail,
  verifyPassword,
  logAuth
};
