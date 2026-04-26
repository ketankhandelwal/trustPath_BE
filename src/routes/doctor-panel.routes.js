console.log('[routes/doctor-panel] Loading doctor-facing routes');

const express = require('express');
const router = express.Router();

const referralController = require('../controllers/referral.controller');
const reportController = require('../controllers/report.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { referPatientSchema, listReferralsSchema } = require('../validators/referral.validator');
const { listReportsSchema } = require('../validators/report.validator');

router.use(authenticate('doctor'));
console.log('[routes/doctor-panel] doctor auth guard applied');

router.post(
  '/refer-patient',
  validate(referPatientSchema),
  asyncHandler(referralController.referPatient)
);
console.log('[routes/doctor-panel] POST /refer-patient registered');

router.get(
  '/my-referrals',
  validate(listReferralsSchema, 'query'),
  asyncHandler(referralController.listMyReferrals)
);
console.log('[routes/doctor-panel] GET /my-referrals registered');

router.get(
  '/reports',
  validate(listReportsSchema, 'query'),
  asyncHandler(reportController.listDoctor)
);
console.log('[routes/doctor-panel] GET /reports registered');

router.get('/reports/:id', asyncHandler(reportController.getByIdDoctor));
console.log('[routes/doctor-panel] GET /reports/:id registered');

router.get('/reports/:id/download', asyncHandler(reportController.downloadDoctor));
console.log('[routes/doctor-panel] GET /reports/:id/download registered');

module.exports = router;
