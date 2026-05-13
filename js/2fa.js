const bcrypt = require('bcryptjs');

function generate2FACode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashCode(code) {
  return await bcrypt.hash(code, 10);
}

async function verifyCode(code, hash) {
  return await bcrypt.compare(code, hash);
}

module.exports = { generate2FACode, hashCode, verifyCode };
