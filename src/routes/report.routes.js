console.log('[routes/report] Loading admin-facing report routes');

const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { upload } = require('../middlewares/upload');
const {
  createReportSchema,
  updateReportSchema,
  updateStatusSchema,
  listReportsSchema,
} = require('../validators/report.validator');

router.use(authenticate('admin'));
console.log('[routes/report] admin auth guard applied');

router.post(
  '/',
  upload.single('file'),
  validate(createReportSchema),
  asyncHandler(reportController.create)
);
console.log('[routes/report] POST / registered');

router.get('/', validate(listReportsSchema, 'query'), asyncHandler(reportController.listAdmin));
console.log('[routes/report] GET / registered');

router.get('/:id', asyncHandler(reportController.getByIdAdmin));
console.log('[routes/report] GET /:id registered');

router.put(
  '/:id',
  upload.single('file'),
  validate(updateReportSchema),
  asyncHandler(reportController.update)
);
console.log('[routes/report] PUT /:id registered');

router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  asyncHandler(reportController.updateStatus)
);
console.log('[routes/report] PATCH /:id/status registered');

router.get('/:id/download', asyncHandler(reportController.downloadAdmin));
console.log('[routes/report] GET /:id/download registered');

module.exports = router;
