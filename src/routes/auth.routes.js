console.log('[routes/auth] Loading auth routes');

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  adminLoginSchema,
  doctorLoginSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

router.post(
  '/admin/login',
  validate(adminLoginSchema),
  asyncHandler(authController.adminLogin)
);
console.log('[routes/auth] POST /admin/login registered');

router.post(
  '/doctor/login',
  validate(doctorLoginSchema),
  asyncHandler(authController.doctorLogin)
);
console.log('[routes/auth] POST /doctor/login registered');

router.post(
  '/admin/change-password',
  authenticate('admin'),
  validate(changePasswordSchema),
  asyncHandler(authController.adminChangePassword)
);
console.log('[routes/auth] POST /admin/change-password registered');

router.post(
  '/doctor/change-password',
  authenticate('doctor'),
  validate(changePasswordSchema),
  asyncHandler(authController.doctorChangePassword)
);
console.log('[routes/auth] POST /doctor/change-password registered');

router.post('/logout', authenticate(), asyncHandler(authController.logout));
console.log('[routes/auth] POST /logout registered');

router.get('/me', authenticate(), asyncHandler(authController.me));
console.log('[routes/auth] GET /me registered');

module.exports = router;
