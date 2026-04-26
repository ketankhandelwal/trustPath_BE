console.log('[controllers/auth] Loading auth controller');

const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');

const adminLogin = async (req, res) => {
  console.log('[auth.controller.adminLogin] body email:', req.body.email);
  const result = await authService.loginAdmin(req.body);
  console.log('[auth.controller.adminLogin] Login successful');
  return success(res, 200, 'Admin login successful', result);
};

const doctorLogin = async (req, res) => {
  console.log('[auth.controller.doctorLogin] login_id:', req.body.login_id);
  const result = await authService.loginDoctor(req.body);
  console.log('[auth.controller.doctorLogin] Login successful');
  return success(res, 200, 'Doctor login successful', result);
};

const adminChangePassword = async (req, res) => {
  console.log('[auth.controller.adminChangePassword] adminId:', req.user.id);
  await authService.changeAdminPassword(req.user.id, req.body);
  console.log('[auth.controller.adminChangePassword] Password changed');
  return success(res, 200, 'Password updated successfully');
};

const doctorChangePassword = async (req, res) => {
  console.log('[auth.controller.doctorChangePassword] doctorId:', req.user.id);
  await authService.changeDoctorPassword(req.user.id, req.body);
  console.log('[auth.controller.doctorChangePassword] Password changed');
  return success(res, 200, 'Password updated successfully');
};

const logout = async (req, res) => {
  console.log('[auth.controller.logout] userId:', req.user && req.user.id);
  // Stateless JWT: client should discard the token. Server just acknowledges.
  return success(res, 200, 'Logged out successfully');
};

const me = async (req, res) => {
  console.log('[auth.controller.me] role:', req.user.role, 'id:', req.user.id);
  return success(res, 200, 'Current user', req.user);
};

module.exports = {
  adminLogin,
  doctorLogin,
  adminChangePassword,
  doctorChangePassword,
  logout,
  me,
};
