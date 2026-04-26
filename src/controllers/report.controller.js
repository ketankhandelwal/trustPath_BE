console.log('[controllers/report] Loading report controller');

const reportService = require('../services/report.service');
const { success } = require('../utils/apiResponse');

const create = async (req, res) => {
  console.log('[report.controller.create] admin:', req.user.id, 'file:', req.file && req.file.originalname);
  const report = await reportService.createReport(req.body, req.file, req.user.id);
  console.log('[report.controller.create] created id:', report.id);
  return success(res, 201, 'Report uploaded successfully', report);
};

const update = async (req, res) => {
  console.log('[report.controller.update] id:', req.params.id);
  const report = await reportService.updateReport(req.params.id, req.body, req.file);
  console.log('[report.controller.update] updated id:', report.id);
  return success(res, 200, 'Report updated successfully', report);
};

const updateStatus = async (req, res) => {
  console.log('[report.controller.updateStatus] id:', req.params.id, 'status:', req.body.status);
  const report = await reportService.updateStatus(req.params.id, req.body.status);
  console.log('[report.controller.updateStatus] status applied');
  return success(res, 200, 'Report status updated', report);
};

const getByIdAdmin = async (req, res) => {
  console.log('[report.controller.getByIdAdmin] id:', req.params.id);
  const report = await reportService.getReportById(req.params.id);
  console.log('[report.controller.getByIdAdmin] fetched');
  return success(res, 200, 'Report fetched', report);
};

const listAdmin = async (req, res) => {
  console.log('[report.controller.listAdmin] query:', req.query);
  const result = await reportService.listReports(req.query);
  console.log('[report.controller.listAdmin] items:', result.items.length);
  return success(res, 200, 'Reports list', result);
};

const getByIdDoctor = async (req, res) => {
  console.log('[report.controller.getByIdDoctor] id:', req.params.id, 'doctor:', req.user.id);
  const report = await reportService.getReportById(req.params.id, { doctorId: req.user.id });
  console.log('[report.controller.getByIdDoctor] fetched');
  return success(res, 200, 'Report fetched', report);
};

const listDoctor = async (req, res) => {
  console.log('[report.controller.listDoctor] doctor:', req.user.id);
  const result = await reportService.listReports(req.query, { doctorId: req.user.id });
  console.log('[report.controller.listDoctor] items:', result.items.length);
  return success(res, 200, 'My reports', result);
};

const downloadAdmin = async (req, res) => {
  console.log('[report.controller.downloadAdmin] id:', req.params.id);
  const file = await reportService.getReportFileForDownload(req.params.id);
  console.log('[report.controller.downloadAdmin] redirecting to S3 presigned url for:', file.originalName);
  if (req.query.json === '1') {
    return success(res, 200, 'Report download URL', file);
  }
  return res.redirect(302, file.url);
};

const downloadDoctor = async (req, res) => {
  console.log('[report.controller.downloadDoctor] id:', req.params.id, 'doctor:', req.user.id);
  const file = await reportService.getReportFileForDownload(req.params.id, { doctorId: req.user.id });
  console.log('[report.controller.downloadDoctor] redirecting to S3 presigned url for:', file.originalName);
  if (req.query.json === '1') {
    return success(res, 200, 'Report download URL', file);
  }
  return res.redirect(302, file.url);
};

module.exports = {
  create,
  update,
  updateStatus,
  getByIdAdmin,
  listAdmin,
  getByIdDoctor,
  listDoctor,
  downloadAdmin,
  downloadDoctor,
};
