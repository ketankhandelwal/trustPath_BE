require('dotenv').config();
console.log('[utils/jwt] Loading JWT helpers');

const jwt = require('jsonwebtoken');
console.log('[utils/jwt] jsonwebtoken loaded');

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
console.log('[utils/jwt] JWT configured with expiry:', EXPIRES_IN);

const signToken = (payload) => {
  console.log('[jwt.signToken] Signing token for payload role:', payload.role, 'id:', payload.id);
  const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
  console.log('[jwt.signToken] Token generated');
  return token;
};

const verifyToken = (token) => {
  console.log('[jwt.verifyToken] Verifying token');
  try {
    const decoded = jwt.verify(token, SECRET);
    console.log('[jwt.verifyToken] Token valid for role:', decoded.role, 'id:', decoded.id);
    return decoded;
  } catch (err) {
    console.log('[jwt.verifyToken] Token invalid:', err.message);
    throw err;
  }
};

module.exports = { signToken, verifyToken };
