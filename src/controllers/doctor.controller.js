console.log('[controllers/doctor] Loading doctor controller');

const doctorService = require('../services/doctor.service');
const { success } = require('../utils/apiResponse');

const create = async (req, res) => {
  console.log('[doctor.controller.create] admin:', req.user.id);
  const doctor = await doctorService.createDoctor(req.body, req.user.id);
  console.log('[doctor.controller.create] created doctor id:', doctor.id);
  return success(res, 201, 'Doctor created successfully', doctor);
};

const update = async (req, res) => {
  console.log('[doctor.controller.update] id:', req.params.id);
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  console.log('[doctor.controller.update] updated doctor id:', doctor.id);
  return success(res, 200, 'Doctor updated successfully', doctor);
};

const toggleStatus = async (req, res) => {
  console.log('[doctor.controller.toggleStatus] id:', req.params.id, 'is_active:', req.body.is_active);
  const doctor = await doctorService.toggleDoctorStatus(req.params.id, req.body.is_active);
  const msg = doctor.is_active ? 'Doctor activated' : 'Doctor deactivated';
  console.log('[doctor.controller.toggleStatus] result:', msg);
  return success(res, 200, msg, doctor);
};

const getById = async (req, res) => {
  console.log('[doctor.controller.getById] id:', req.params.id);
  const doctor = await doctorService.getDoctorById(req.params.id);
  console.log('[doctor.controller.getById] sending doctor');
  return success(res, 200, 'Doctor fetched', doctor);
};

const list = async (req, res) => {
  console.log('[doctor.controller.list] query:', req.query);
  const result = await doctorService.listDoctors(req.query);
  console.log('[doctor.controller.list] items:', result.items.length);
  return success(res, 200, 'Doctors list', result);
};

module.exports = { create, update, toggleStatus, getById, list };
