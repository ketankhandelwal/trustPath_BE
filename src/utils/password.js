console.log('[utils/password] Loading bcrypt helpers');

const bcrypt = require('bcryptjs');
console.log('[utils/password] bcryptjs loaded');

const hashPassword = async (plain) => {
  console.log('[password.hashPassword] Hashing password');
  const hash = await bcrypt.hash(plain, 10);
  console.log('[password.hashPassword] Hash generated');
  return hash;
};

const comparePassword = async (plain, hash) => {
  console.log('[password.comparePassword] Comparing plain to hash');
  const ok = await bcrypt.compare(plain, hash);
  console.log('[password.comparePassword] Match:', ok);
  return ok;
};

module.exports = { hashPassword, comparePassword };
