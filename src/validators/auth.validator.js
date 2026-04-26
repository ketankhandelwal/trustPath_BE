console.log('[validators/auth] Loading Joi schemas');

const Joi = require('joi');

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});
console.log('[validators/auth] adminLoginSchema ready');

const doctorLoginSchema = Joi.object({
  login_id: Joi.string().min(3).max(80).required(),
  password: Joi.string().min(6).max(100).required(),
});
console.log('[validators/auth] doctorLoginSchema ready');

const changePasswordSchema = Joi.object({
  old_password: Joi.string().min(6).max(100).required(),
  new_password: Joi.string().min(6).max(100).required(),
});
console.log('[validators/auth] changePasswordSchema ready');

module.exports = { adminLoginSchema, doctorLoginSchema, changePasswordSchema };
