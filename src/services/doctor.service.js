console.log('[services/doctor] Loading doctor service');

const { query } = require('../config/db');
const { hashPassword } = require('../utils/password');

const createDoctor = async (payload, createdByAdminId) => {
  console.log('[doctor.service.createDoctor] Creating doctor with email:', payload.email);
  const existing = await query(
    'SELECT id FROM doctors WHERE email = $1 OR login_id = $2 LIMIT 1',
    [payload.email, payload.login_id]
  );
  console.log('[doctor.service.createDoctor] Duplicate check rows:', existing.rowCount);
  if (existing.rowCount > 0) {
    const err = new Error('Doctor with this email or login_id already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(payload.password);
  console.log('[doctor.service.createDoctor] Password hashed');

  const isActive = payload.status ? payload.status === 'active' : true;
  console.log('[doctor.service.createDoctor] is_active resolved to:', isActive);

  const { rows } = await query(
    `INSERT INTO doctors
       (name, phone, email, speciality, hospital, address, login_id, password_hash, is_active, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, name, phone, email, speciality, hospital, address, login_id, is_active, created_at`,
    [
      payload.name,
      payload.phone,
      payload.email,
      payload.speciality,
      payload.hospital || null,
      payload.address || null,
      payload.login_id,
      passwordHash,
      isActive,
      createdByAdminId || null,
    ]
  );
  console.log('[doctor.service.createDoctor] Doctor inserted id:', rows[0].id);
  return rows[0];
};

const updateDoctor = async (doctorId, payload) => {
  console.log('[doctor.service.updateDoctor] doctorId:', doctorId);
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(payload)) {
    console.log('[doctor.service.updateDoctor] field:', key);
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (fields.length === 0) {
    console.log('[doctor.service.updateDoctor] No fields to update');
    const err = new Error('No fields provided to update');
    err.status = 400;
    throw err;
  }
  fields.push('updated_at = NOW()');
  values.push(doctorId);
  const sql = `UPDATE doctors SET ${fields.join(', ')} WHERE id = $${idx}
               RETURNING id, name, phone, email, speciality, hospital, address, login_id, is_active, created_at, updated_at`;
  console.log('[doctor.service.updateDoctor] Running update SQL');
  const { rows } = await query(sql, values);
  console.log('[doctor.service.updateDoctor] rows affected:', rows.length);
  if (!rows[0]) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
};

const toggleDoctorStatus = async (doctorId, isActive) => {
  console.log('[doctor.service.toggleDoctorStatus] doctorId:', doctorId, 'isActive:', isActive);
  const { rows } = await query(
    `UPDATE doctors SET is_active = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, name, email, login_id, is_active`,
    [isActive, doctorId]
  );
  console.log('[doctor.service.toggleDoctorStatus] rows:', rows.length);
  if (!rows[0]) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
};

const getDoctorById = async (doctorId) => {
  console.log('[doctor.service.getDoctorById] doctorId:', doctorId);
  const { rows } = await query(
    `SELECT d.id, d.name, d.phone, d.email, d.speciality, d.hospital, d.address,
            d.login_id, d.is_active, d.created_at, d.updated_at,
            (SELECT COUNT(*) FROM reports r WHERE r.referred_by_doctor_id = d.id) AS reports_shared,
            (SELECT COUNT(*) FROM referrals rf WHERE rf.doctor_id = d.id) AS patients_referred
       FROM doctors d
      WHERE d.id = $1 LIMIT 1`,
    [doctorId]
  );
  console.log('[doctor.service.getDoctorById] found:', !!rows[0]);
  if (!rows[0]) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
};

const listDoctors = async (filters) => {
  console.log('[doctor.service.listDoctors] filters:', filters);
  const {
    q,
    is_active,
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    sort_dir = 'desc',
  } = filters;

  const where = [];
  const params = [];
  let idx = 1;

  if (q) {
    console.log('[doctor.service.listDoctors] adding search clause for q:', q);
    where.push(
      `(name ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx} OR address ILIKE $${idx} OR hospital ILIKE $${idx})`
    );
    params.push(`%${q}%`);
    idx++;
  }

  if (typeof is_active === 'boolean') {
    console.log('[doctor.service.listDoctors] is_active filter:', is_active);
    where.push(`is_active = $${idx++}`);
    params.push(is_active);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  console.log('[doctor.service.listDoctors] offset:', offset, 'limit:', limit);

  const orderSql = `ORDER BY ${sort_by} ${sort_dir.toUpperCase()}`;
  console.log('[doctor.service.listDoctors] order clause:', orderSql);

  const listSql = `
    SELECT d.id, d.name, d.phone, d.email, d.speciality, d.hospital, d.address,
           d.login_id, d.is_active, d.created_at,
           (SELECT COUNT(*) FROM reports r WHERE r.referred_by_doctor_id = d.id) AS reports_shared,
           (SELECT COUNT(*) FROM referrals rf WHERE rf.doctor_id = d.id) AS patients_referred
      FROM doctors d
      ${whereSql}
      ${orderSql}
      LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);
  console.log('[doctor.service.listDoctors] executing list SQL');
  const { rows } = await query(listSql, params);
  console.log('[doctor.service.listDoctors] fetched', rows.length, 'rows');

  const countParams = params.slice(0, params.length - 2);
  const countSql = `SELECT COUNT(*)::int AS total FROM doctors d ${whereSql}`;
  console.log('[doctor.service.listDoctors] executing count SQL');
  const { rows: countRows } = await query(countSql, countParams);
  const total = countRows[0].total;
  console.log('[doctor.service.listDoctors] total:', total);

  return {
    items: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

module.exports = {
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  getDoctorById,
  listDoctors,
};
