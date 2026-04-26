console.log('[services/report] Loading report service (S3-backed)');

const { query } = require('../config/db');
const {
  uploadBufferToS3,
  getPresignedDownloadUrl,
  getPresignedInlineUrl,
  deleteFromS3,
} = require('../utils/s3');

const deriveFileType = (mimetype) => {
  console.log('[report.service.deriveFileType] mimetype:', mimetype);
  if (!mimetype) return null;
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'image/png') return 'png';
  if (mimetype === 'image/jpeg') return 'jpg';
  if (mimetype === 'application/msword') return 'doc';
  if (mimetype.includes('officedocument.wordprocessingml')) return 'docx';
  return 'other';
};

const attachFileUrl = async (report) => {
  console.log('[report.service.attachFileUrl] report:', report && report.id);
  if (!report) return report;
  if (report.file_path) {
    try {
      report.file_url = await getPresignedInlineUrl(report.file_path);
      console.log('[report.service.attachFileUrl] attached presigned url');
    } catch (err) {
      console.log('[report.service.attachFileUrl] failed to sign:', err.message);
      report.file_url = null;
    }
  } else {
    report.file_url = null;
  }
  return report;
};

const createReport = async (payload, file, adminId) => {
  console.log('[report.service.createReport] uploading report for admin:', adminId);
  console.log('[report.service.createReport] file present:', !!file);

  let fileKey = null;
  let fileType = null;
  let fileOriginalName = null;
  let fileSize = null;

  if (file) {
    console.log('[report.service.createReport] uploading file to S3:', file.originalname);
    const uploaded = await uploadBufferToS3(file);
    fileKey = uploaded.key;
    fileType = deriveFileType(file.mimetype);
    fileOriginalName = file.originalname;
    fileSize = file.size;
    console.log('[report.service.createReport] S3 key:', fileKey);
  }

  const { rows } = await query(
    `INSERT INTO reports
       (report_name, sample_date, reg_no, lab_no, patient_name, age, sex,
        patient_id, referred_by_doctor_id, referred_by_self, panel, investigation, status,
        file_path, file_type, file_original_name, file_size_bytes, uploaded_by_admin_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      payload.report_name,
      payload.sample_date || null,
      payload.reg_no || null,
      payload.lab_no || null,
      payload.patient_name,
      payload.age ?? null,
      payload.sex || null,
      payload.patient_id || null,
      payload.referred_by_doctor_id || null,
      payload.referred_by_self || false,
      payload.panel || null,
      payload.investigation || null,
      payload.status || 'in_progress',
      fileKey,
      fileType,
      fileOriginalName,
      fileSize,
      adminId,
    ]
  );
  console.log('[report.service.createReport] report inserted id:', rows[0].id);
  return attachFileUrl(rows[0]);
};

const updateReport = async (reportId, payload, file) => {
  console.log('[report.service.updateReport] reportId:', reportId);

  let oldKeyToDelete = null;
  if (file) {
    console.log('[report.service.updateReport] new file incoming, fetching old key');
    const { rows: existing } = await query(
      `SELECT file_path FROM reports WHERE id = $1`,
      [reportId]
    );
    if (!existing[0]) {
      console.log('[report.service.updateReport] report not found pre-update');
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }
    oldKeyToDelete = existing[0].file_path || null;
    console.log('[report.service.updateReport] old key:', oldKeyToDelete);
  }

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(payload)) {
    console.log('[report.service.updateReport] field:', key);
    fields.push(`${key} = $${idx++}`);
    values.push(value === '' ? null : value);
  }

  if (file) {
    console.log('[report.service.updateReport] uploading replacement to S3:', file.originalname);
    const uploaded = await uploadBufferToS3(file);
    fields.push(`file_path = $${idx++}`);
    values.push(uploaded.key);
    fields.push(`file_type = $${idx++}`);
    values.push(deriveFileType(file.mimetype));
    fields.push(`file_original_name = $${idx++}`);
    values.push(file.originalname);
    fields.push(`file_size_bytes = $${idx++}`);
    values.push(file.size);
  }

  if (fields.length === 0) {
    console.log('[report.service.updateReport] nothing to update');
    const err = new Error('No fields provided to update');
    err.status = 400;
    throw err;
  }

  fields.push('updated_at = NOW()');
  values.push(reportId);
  const sql = `UPDATE reports SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  console.log('[report.service.updateReport] executing update');
  const { rows } = await query(sql, values);
  if (!rows[0]) {
    console.log('[report.service.updateReport] report not found');
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }
  console.log('[report.service.updateReport] updated report id:', rows[0].id);

  if (oldKeyToDelete && oldKeyToDelete !== rows[0].file_path) {
    console.log('[report.service.updateReport] deleting stale S3 key:', oldKeyToDelete);
    await deleteFromS3(oldKeyToDelete);
  }

  return attachFileUrl(rows[0]);
};

const updateStatus = async (reportId, status) => {
  console.log('[report.service.updateStatus] reportId:', reportId, 'status:', status);
  const { rows } = await query(
    `UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, reportId]
  );
  if (!rows[0]) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }
  console.log('[report.service.updateStatus] status updated for id:', rows[0].id);
  return attachFileUrl(rows[0]);
};

const getReportById = async (reportId, scope = {}) => {
  console.log('[report.service.getReportById] reportId:', reportId, 'scope:', scope);
  const params = [reportId];
  let where = 'r.id = $1';
  if (scope.doctorId) {
    console.log('[report.service.getReportById] restricting to doctor:', scope.doctorId);
    where += ' AND r.referred_by_doctor_id = $2';
    params.push(scope.doctorId);
  }
  const { rows } = await query(
    `SELECT r.*, d.name AS doctor_name, d.email AS doctor_email
       FROM reports r
       LEFT JOIN doctors d ON d.id = r.referred_by_doctor_id
      WHERE ${where} LIMIT 1`,
    params
  );
  if (!rows[0]) {
    console.log('[report.service.getReportById] not found or out of scope');
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }
  console.log('[report.service.getReportById] found report');
  return attachFileUrl(rows[0]);
};

const listReports = async (filters, scope = {}) => {
  console.log('[report.service.listReports] filters:', filters, 'scope:', scope);
  const {
    q,
    status,
    referred_by_doctor_id,
    from_date,
    to_date,
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    sort_dir = 'desc',
  } = filters;

  const where = [];
  const params = [];
  let idx = 1;

  if (scope.doctorId) {
    console.log('[report.service.listReports] scoped to doctor:', scope.doctorId);
    where.push(`r.referred_by_doctor_id = $${idx++}`);
    params.push(scope.doctorId);
  }

  if (q) {
    console.log('[report.service.listReports] search q:', q);
    where.push(
      `(r.report_name ILIKE $${idx} OR r.patient_name ILIKE $${idx} OR r.reg_no ILIKE $${idx} OR r.lab_no ILIKE $${idx})`
    );
    params.push(`%${q}%`);
    idx++;
  }

  if (status) {
    console.log('[report.service.listReports] status filter:', status);
    where.push(`r.status = $${idx++}`);
    params.push(status);
  }

  if (referred_by_doctor_id && !scope.doctorId) {
    console.log('[report.service.listReports] doctor filter:', referred_by_doctor_id);
    where.push(`r.referred_by_doctor_id = $${idx++}`);
    params.push(referred_by_doctor_id);
  }

  if (from_date) {
    console.log('[report.service.listReports] from_date:', from_date);
    where.push(`r.created_at >= $${idx++}`);
    params.push(from_date);
  }
  if (to_date) {
    console.log('[report.service.listReports] to_date:', to_date);
    where.push(`r.created_at <= $${idx++}`);
    params.push(to_date);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  console.log('[report.service.listReports] offset:', offset);
  const orderSql = `ORDER BY r.${sort_by} ${sort_dir.toUpperCase()}`;
  console.log('[report.service.listReports] order:', orderSql);

  const listSql = `
    SELECT r.*, d.name AS doctor_name
      FROM reports r
      LEFT JOIN doctors d ON d.id = r.referred_by_doctor_id
      ${whereSql}
      ${orderSql}
      LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);
  console.log('[report.service.listReports] running list query');
  const { rows } = await query(listSql, params);
  console.log('[report.service.listReports] rows fetched:', rows.length);

  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM reports r ${whereSql}`,
    countParams
  );
  const total = countRows[0].total;
  console.log('[report.service.listReports] total:', total);

  const items = await Promise.all(rows.map(attachFileUrl));
  console.log('[report.service.listReports] presigned urls attached to items');

  return {
    items,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

const getReportFileForDownload = async (reportId, scope = {}) => {
  console.log('[report.service.getReportFileForDownload] reportId:', reportId, 'scope:', scope);
  const report = await getReportById(reportId, scope);
  if (!report.file_path) {
    console.log('[report.service.getReportFileForDownload] no file attached');
    const err = new Error('No file attached to this report');
    err.status = 404;
    throw err;
  }
  console.log('[report.service.getReportFileForDownload] signing S3 download url for key:', report.file_path);
  const url = await getPresignedDownloadUrl(report.file_path, report.file_original_name);
  console.log('[report.service.getReportFileForDownload] presigned download url ready');
  return {
    url,
    originalName: report.file_original_name,
    fileType: report.file_type,
    key: report.file_path,
  };
};

module.exports = {
  createReport,
  updateReport,
  updateStatus,
  getReportById,
  listReports,
  getReportFileForDownload,
};
