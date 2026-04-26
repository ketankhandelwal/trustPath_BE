console.log('[routes/doctor] Loading admin-facing doctor routes');

const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctor.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  createDoctorSchema,
  updateDoctorSchema,
  toggleStatusSchema,
  listDoctorsSchema,
} = require('../validators/doctor.validator');

router.use(authenticate('admin'));
console.log('[routes/doctor] admin-only guard applied');

router.post('/', validate(createDoctorSchema), asyncHandler(doctorController.create));
console.log('[routes/doctor] POST / registered');

router.get('/', validate(listDoctorsSchema, 'query'), asyncHandler(doctorController.list));
console.log('[routes/doctor] GET / registered');

router.get('/:id', asyncHandler(doctorController.getById));
console.log('[routes/doctor] GET /:id registered');

router.put('/:id', validate(updateDoctorSchema), asyncHandler(doctorController.update));
console.log('[routes/doctor] PUT /:id registered');

router.patch(
  '/:id/status',
  validate(toggleStatusSchema),
  asyncHandler(doctorController.toggleStatus)
);
console.log('[routes/doctor] PATCH /:id/status registered');

module.exports = router;
