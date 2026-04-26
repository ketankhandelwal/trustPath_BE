console.log('[routes/referral] Loading admin-facing referral listing routes');

const express = require('express');
const router = express.Router();

const referralController = require('../controllers/referral.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { listReferralsSchema } = require('../validators/referral.validator');

router.use(authenticate('admin'));
console.log('[routes/referral] admin auth guard applied');

router.get(
  '/',
  validate(listReferralsSchema, 'query'),
  asyncHandler(referralController.listAllReferrals)
);
console.log('[routes/referral] GET / registered');

module.exports = router;
