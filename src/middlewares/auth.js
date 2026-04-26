console.log('[middlewares/auth] Loading auth middleware');

const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');
const { query } = require('../config/db');

const extractToken = (req) => {
  console.log('[auth.extractToken] Checking Authorization header');
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    console.log('[auth.extractToken] No Bearer token found');
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  console.log('[auth.extractToken] Bearer token extracted (length):', token.length);
  return token;
};

const authenticate = (requiredRole = null) => async (req, res, next) => {
  console.log('[auth.authenticate] required role:', requiredRole || 'any');
  try {
    const token = extractToken(req);
    if (!token) {
      console.log('[auth.authenticate] Missing token');
      return error(res, 401, 'Authentication required');
    }

    const decoded = verifyToken(token);
    console.log('[auth.authenticate] Decoded payload role:', decoded.role);

    if (requiredRole && decoded.role !== requiredRole) {
      console.log('[auth.authenticate] Role mismatch — required:', requiredRole, 'got:', decoded.role);
      return error(res, 403, 'Forbidden: insufficient role');
    }

    if (decoded.role === 'admin') {
      console.log('[auth.authenticate] Loading admin record for id:', decoded.id);
      const { rows } = await query(
        'SELECT id, name, email, is_active FROM admins WHERE id = $1 LIMIT 1',
        [decoded.id]
      );
      const admin = rows[0];
      console.log('[auth.authenticate] Admin found:', !!admin);
      if (!admin || !admin.is_active) {
        console.log('[auth.authenticate] Admin not found or inactive');
        return error(res, 401, 'Admin account is disabled');
      }
      req.user = { ...admin, role: 'admin' };
    } else if (decoded.role === 'doctor') {
      console.log('[auth.authenticate] Loading doctor record for id:', decoded.id);
      const { rows } = await query(
        'SELECT id, name, email, login_id, is_active FROM doctors WHERE id = $1 LIMIT 1',
        [decoded.id]
      );
      const doctor = rows[0];
      console.log('[auth.authenticate] Doctor found:', !!doctor);
      if (!doctor) {
        console.log('[auth.authenticate] Doctor record missing');
        return error(res, 401, 'Doctor account not found');
      }
      if (!doctor.is_active) {
        console.log('[auth.authenticate] Doctor deactivated by admin');
        return error(
          res,
          403,
          'Admin ne aapka account remove kar diya hai, please Nidan Pathology se contact karein.'
        );
      }
      req.user = { ...doctor, role: 'doctor' };
    } else {
      console.log('[auth.authenticate] Unknown role in token');
      return error(res, 401, 'Invalid token role');
    }

    console.log('[auth.authenticate] Auth success for user id:', req.user.id);
    return next();
  } catch (err) {
    console.log('[auth.authenticate] Error:', err.message);
    return error(res, 401, 'Invalid or expired token');
  }
};

module.exports = { authenticate };
