console.log('[validators/report] Loading Joi schemas for reports');

const Joi = require('joi');

const REPORT_STATUSES = ['completed', 'incomplete', 'in_progress'];

const createReportSchema = Joi.object({
  report_name: Joi.string().min(2).max(200).required(),
  sample_date: Joi.string().isoDate().allow(null, ''),
  reg_no: Joi.string().max(80).allow('', null),
  lab_no: Joi.string().max(80).allow('', null),
  patient_name: Joi.string().min(2).max(160).required(),
  age: Joi.number().integer().min(0).max(150).allow(null),
  sex: Joi.string().valid('male', 'female', 'other').allow(null, ''),
  patient_id: Joi.string().uuid().allow(null, ''),
  referred_by_doctor_id: Joi.string().uuid().allow(null, ''),
  referred_by_self: Joi.boolean().default(false),
  panel: Joi.string().max(160).allow('', null),
  investigation: Joi.string().max(2000).allow('', null),
  status: Joi.string().valid(...REPORT_STATUSES).default('in_progress'),
});
console.log('[validators/report] createReportSchema ready');

const updateReportSchema = Joi.object({
  report_name: Joi.string().min(2).max(200),
  sample_date: Joi.string().isoDate().allow(null, ''),
  reg_no: Joi.string().max(80).allow('', null),
  lab_no: Joi.string().max(80).allow('', null),
  patient_name: Joi.string().min(2).max(160),
  age: Joi.number().integer().min(0).max(150).allow(null),
  sex: Joi.string().valid('male', 'female', 'other').allow(null, ''),
  patient_id: Joi.string().uuid().allow(null, ''),
  referred_by_doctor_id: Joi.string().uuid().allow(null, ''),
  referred_by_self: Joi.boolean(),
  panel: Joi.string().max(160).allow('', null),
  investigation: Joi.string().max(2000).allow('', null),
  status: Joi.string().valid(...REPORT_STATUSES),
}).min(1);
console.log('[validators/report] updateReportSchema ready');

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...REPORT_STATUSES).required(),
});
console.log('[validators/report] updateStatusSchema ready');

const listReportsSchema = Joi.object({
  q: Joi.string().max(160).allow('', null),
  status: Joi.string().valid(...REPORT_STATUSES),
  referred_by_doctor_id: Joi.string().uuid(),
  from_date: Joi.date().iso(),
  to_date: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort_by: Joi.string().valid('created_at', 'sample_date', 'report_name', 'status').default('created_at'),
  sort_dir: Joi.string().valid('asc', 'desc').default('desc'),
});
console.log('[validators/report] listReportsSchema ready');

module.exports = {
  createReportSchema,
  updateReportSchema,
  updateStatusSchema,
  listReportsSchema,
  REPORT_STATUSES,
};
