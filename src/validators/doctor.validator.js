console.log('[validators/doctor] Loading Joi schemas for doctor management');

const Joi = require('joi');

const createDoctorSchema = Joi.object({
  name: Joi.string().min(2).max(160).required(),
  phone: Joi.string().min(7).max(20).required(),
  email: Joi.string().email().required(),
  speciality: Joi.string().min(2).max(120).required(),
  hospital: Joi.string().max(200).allow('', null),
  address: Joi.string().max(1000).allow('', null),
  status: Joi.string().valid('active', 'inactive').default('active'),
  login_id: Joi.string().min(3).max(80).required(),
  password: Joi.string().min(6).max(100).required(),
});
console.log('[validators/doctor] createDoctorSchema ready');

const updateDoctorSchema = Joi.object({
  name: Joi.string().min(2).max(160),
  phone: Joi.string().min(7).max(20),
  email: Joi.string().email(),
  speciality: Joi.string().min(2).max(120),
  hospital: Joi.string().max(200).allow('', null),
  address: Joi.string().max(1000).allow('', null),
}).min(1);
console.log('[validators/doctor] updateDoctorSchema ready');

const toggleStatusSchema = Joi.object({
  is_active: Joi.boolean().required(),
});
console.log('[validators/doctor] toggleStatusSchema ready');

const listDoctorsSchema = Joi.object({
  q: Joi.string().max(120).allow('', null),
  is_active: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(500).default(20),
  sort_by: Joi.string().valid('created_at', 'name', 'email').default('created_at'),
  sort_dir: Joi.string().valid('asc', 'desc').default('desc'),
});
console.log('[validators/doctor] listDoctorsSchema ready');

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
  toggleStatusSchema,
  listDoctorsSchema,
};
