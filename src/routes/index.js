console.log('[routes/index] Registering API routes');

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const doctorRoutes = require('./doctor.routes');
const reportRoutes = require('./report.routes');
const referralRoutes = require('./referral.routes');
const doctorPanelRoutes = require('./doctor-panel.routes');

router.get('/health', (req, res) => {
  console.log('[routes/index] GET /health hit');
  res.status(200).json({ success: true, message: 'OK', time: new Date().toISOString() });
});
console.log('[routes/index] GET /health registered');

router.use('/auth', authRoutes);
console.log('[routes/index] /auth mounted');

router.use('/admin/doctors', doctorRoutes);
console.log('[routes/index] /admin/doctors mounted');

router.use('/admin/reports', reportRoutes);
console.log('[routes/index] /admin/reports mounted');

router.use('/admin/referrals', referralRoutes);
console.log('[routes/index] /admin/referrals mounted');

router.use('/doctor', doctorPanelRoutes);
console.log('[routes/index] /doctor mounted');

module.exports = router;
