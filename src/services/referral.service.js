console.log('[services/referral] Loading referral service');

const { pool, query } = require('../config/db');

const referPatient = async (doctorId, payload) => {
  console.log('[referral.service.referPatient] doctor:', doctorId, 'patient name:', payload.name);
  const client = await pool.connect();
  console.log('[referral.service.referPatient] acquired DB client for transaction');
  try {
    await client.query('BEGIN');
    console.log('[referral.service.referPatient] BEGIN transaction');

    const patientInsert = await client.query(
      `INSERT INTO patients (name, age, sex, phone, email, address, referred_by_doctor_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        payload.name,
        payload.age ?? null,
        payload.sex || null,
        payload.phone || null,
        payload.email || null,
        payload.address || null,
        doctorId,
        payload.notes || null,
      ]
    );
    const patient = patientInsert.rows[0];
    console.log('[referral.service.referPatient] patient inserted id:', patient.id);

    const referralInsert = await client.query(
      `INSERT INTO referrals (doctor_id, patient_id, notes)
       VALUES ($1,$2,$3) RETURNING *`,
      [doctorId, patient.id, payload.notes || null]
    );
    const referral = referralInsert.rows[0];
    console.log('[referral.service.referPatient] referral inserted id:', referral.id);

    await client.query('COMMIT');
    console.log('[referral.service.referPatient] COMMIT transaction');

    return { patient, referral };
  } catch (err) {
    console.log('[referral.service.referPatient] error, rolling back:', err.message);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    console.log('[referral.service.referPatient] DB client released');
  }
};

const listReferralsForAdmin = async (filters) => {
  console.log('[referral.service.listReferralsForAdmin] filters:', filters);
  const { q, doctor_id, page = 1, limit = 20 } = filters;
  const where = [];
  const params = [];
  let idx = 1;
  if (q) {
    console.log('[referral.service.listReferralsForAdmin] search q:', q);
    where.push(
      `(p.name ILIKE $${idx} OR p.phone ILIKE $${idx} OR p.email ILIKE $${idx} OR d.name ILIKE $${idx})`
    );
    params.push(`%${q}%`);
    idx++;
  }
  if (doctor_id) {
    console.log('[referral.service.listReferralsForAdmin] doctor filter:', doctor_id);
    where.push(`rf.doctor_id = $${idx++}`);
    params.push(doctor_id);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  console.log('[referral.service.listReferralsForAdmin] offset:', offset);

  const listSql = `
    SELECT rf.id AS referral_id, rf.notes AS referral_notes, rf.created_at AS referred_at,
           p.id AS patient_id, p.name AS patient_name, p.age, p.sex, p.phone, p.email, p.address,
           d.id AS doctor_id, d.name AS doctor_name, d.email AS doctor_email, d.phone AS doctor_phone
      FROM referrals rf
      JOIN patients p ON p.id = rf.patient_id
      JOIN doctors d ON d.id = rf.doctor_id
      ${whereSql}
      ORDER BY rf.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);
  console.log('[referral.service.listReferralsForAdmin] executing list SQL');
  const { rows } = await query(listSql, params);
  console.log('[referral.service.listReferralsForAdmin] rows:', rows.length);

  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total
       FROM referrals rf
       JOIN patients p ON p.id = rf.patient_id
       JOIN doctors d ON d.id = rf.doctor_id
       ${whereSql}`,
    countParams
  );
  const total = countRows[0].total;
  console.log('[referral.service.listReferralsForAdmin] total:', total);

  return {
    items: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

const listReferralsForDoctor = async (doctorId, filters) => {
  console.log('[referral.service.listReferralsForDoctor] doctor:', doctorId);
  return listReferralsForAdmin({ ...filters, doctor_id: doctorId });
};

module.exports = { referPatient, listReferralsForAdmin, listReferralsForDoctor };
