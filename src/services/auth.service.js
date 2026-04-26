console.log('[services/auth] Loading auth service');

const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const loginAdmin = async ({ email, password }) => {
  console.log('[auth.service.loginAdmin] email:', email);
  const { rows } = await query(
    'SELECT id, name, email, password_hash, is_active FROM admins WHERE email = $1 LIMIT 1',
    [email]
  );
  const admin = rows[0];
  console.log('[auth.service.loginAdmin] Admin row found:', !!admin);
  if (!admin) {
    console.log('[auth.service.loginAdmin] No admin with this email');
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  if (!admin.is_active) {
    console.log('[auth.service.loginAdmin] Admin is inactive');
    const err = new Error('Admin account is disabled');
    err.status = 403;
    throw err;
  }
  const ok = await comparePassword(password, admin.password_hash);
  console.log('[auth.service.loginAdmin] Password match:', ok);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signToken({ id: admin.id, role: 'admin', email: admin.email });
  console.log('[auth.service.loginAdmin] Admin token issued');
  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
};

const loginDoctor = async ({ login_id, password }) => {
  console.log('[auth.service.loginDoctor] login_id:', login_id);
  const { rows } = await query(
    `SELECT id, name, email, login_id, password_hash, is_active
       FROM doctors WHERE login_id = $1 LIMIT 1`,
    [login_id]
  );
  const doctor = rows[0];
  console.log('[auth.service.loginDoctor] Doctor row found:', !!doctor);
  if (!doctor) {
    console.log('[auth.service.loginDoctor] No doctor with this login_id');
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  if (!doctor.is_active) {
    console.log('[auth.service.loginDoctor] Doctor deactivated by admin');
    const err = new Error(
      'Admin ne aapka account remove kar diya hai, please Nidan Pathology se contact karein.'
    );
    err.status = 403;
    throw err;
  }
  const ok = await comparePassword(password, doctor.password_hash);
  console.log('[auth.service.loginDoctor] Password match:', ok);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signToken({ id: doctor.id, role: 'doctor', login_id: doctor.login_id });
  console.log('[auth.service.loginDoctor] Doctor token issued');
  return {
    token,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      login_id: doctor.login_id,
    },
  };
};

const changeAdminPassword = async (adminId, { old_password, new_password }) => {
  console.log('[auth.service.changeAdminPassword] adminId:', adminId);
  const { rows } = await query(
    'SELECT password_hash FROM admins WHERE id = $1 LIMIT 1',
    [adminId]
  );
  const admin = rows[0];
  console.log('[auth.service.changeAdminPassword] admin found:', !!admin);
  if (!admin) {
    const err = new Error('Admin not found');
    err.status = 404;
    throw err;
  }
  const ok = await comparePassword(old_password, admin.password_hash);
  console.log('[auth.service.changeAdminPassword] old password match:', ok);
  if (!ok) {
    const err = new Error('Old password is incorrect');
    err.status = 400;
    throw err;
  }
  const newHash = await hashPassword(new_password);
  console.log('[auth.service.changeAdminPassword] new hash generated');
  await query(
    'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, adminId]
  );
  console.log('[auth.service.changeAdminPassword] admin password updated');
  return true;
};

const changeDoctorPassword = async (doctorId, { old_password, new_password }) => {
  console.log('[auth.service.changeDoctorPassword] doctorId:', doctorId);
  const { rows } = await query(
    'SELECT password_hash FROM doctors WHERE id = $1 LIMIT 1',
    [doctorId]
  );
  const doctor = rows[0];
  console.log('[auth.service.changeDoctorPassword] doctor found:', !!doctor);
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }
  const ok = await comparePassword(old_password, doctor.password_hash);
  console.log('[auth.service.changeDoctorPassword] old password match:', ok);
  if (!ok) {
    const err = new Error('Old password is incorrect');
    err.status = 400;
    throw err;
  }
  const newHash = await hashPassword(new_password);
  console.log('[auth.service.changeDoctorPassword] new hash generated');
  await query(
    'UPDATE doctors SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, doctorId]
  );
  console.log('[auth.service.changeDoctorPassword] doctor password updated');
  return true;
};

module.exports = {
  loginAdmin,
  loginDoctor,
  changeAdminPassword,
  changeDoctorPassword,
};
