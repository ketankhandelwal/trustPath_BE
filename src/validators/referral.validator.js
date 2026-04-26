console.log('[validators/referral] Loading Joi schemas for referrals');

const Joi = require('joi');

const referPatientSchema = Joi.object({
  name: Joi.string().min(2).max(160).required(),
  age: Joi.number().integer().min(0).max(150).allow(null),
  sex: Joi.string().valid('male', 'female', 'other').allow(null, ''),
  phone: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.string().max(1000).allow('', null),
  notes: Joi.string().max(2000).allow('', null),
});
console.log('[validators/referral] referPatientSchema ready');

const listReferralsSchema = Joi.object({
  q: Joi.string().max(160).allow('', null),
  doctor_id: Joi.string().uuid(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
console.log('[validators/referral] listReferralsSchema ready');

module.exports = { referPatientSchema, listReferralsSchema };
