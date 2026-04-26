# Nidan Pathology BE — cURL Reference

Base URL: `http://localhost:3000`

Auth: Bearer JWT in `Authorization` header. Obtain via admin/doctor login.

Replace placeholders:
- `{{BASE_URL}}` → `http://localhost:3000`
- `{{ADMIN_TOKEN}}` → JWT from admin login
- `{{DOCTOR_TOKEN}}` → JWT from doctor login
- `{{DOCTOR_ID}}` / `{{REPORT_ID}}` → actual UUIDs

---

## 1. Health / Root

```bash
# Root
curl -X GET "http://localhost:3000/"

# Health
curl -X GET "http://localhost:3000/api/health"
```

---

## 2. Auth

### 2.1 Admin Login
```bash
curl -X POST "http://localhost:3000/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nidan.com",
    "password": "admin123"
  }'
```

### 2.2 Doctor Login
```bash
curl -X POST "http://localhost:3000/api/auth/doctor/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login_id": "dr_sharma",
    "password": "doctor123"
  }'
```

### 2.3 Admin Change Password
```bash
curl -X POST "http://localhost:3000/api/auth/admin/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -d '{
    "old_password": "admin123",
    "new_password": "newadmin123"
  }'
```

### 2.4 Doctor Change Password
```bash
curl -X POST "http://localhost:3000/api/auth/doctor/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{DOCTOR_TOKEN}}" \
  -d '{
    "old_password": "doctor123",
    "new_password": "newdoctor123"
  }'
```

### 2.5 Logout
```bash
curl -X POST "http://localhost:3000/api/auth/logout" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

### 2.6 Me (current user)
```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

---

## 3. Admin — Doctors (`/api/admin/doctors`)

### 3.1 Create Doctor
```bash
curl -X POST "http://localhost:3000/api/admin/doctors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -d '{
    "name": "Dr. Ramesh Sharma",
    "phone": "9876543210",
    "email": "ramesh@clinic.com",
    "speciality": "Cardiology",
    "hospital": "City Hospital",
    "address": "MG Road, Indore",
    "status": "active",
    "login_id": "dr_sharma",
    "password": "doctor123"
  }'
```

### 3.2 List Doctors
```bash
curl -X GET "http://localhost:3000/api/admin/doctors?q=sharma&is_active=true&page=1&limit=20&sort_by=created_at&sort_dir=desc" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

### 3.3 Get Doctor by ID
```bash
curl -X GET "http://localhost:3000/api/admin/doctors/{{DOCTOR_ID}}" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

### 3.4 Update Doctor
```bash
curl -X PUT "http://localhost:3000/api/admin/doctors/{{DOCTOR_ID}}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -d '{
    "name": "Dr. Ramesh Sharma",
    "phone": "9876543211",
    "email": "ramesh.new@clinic.com",
    "speciality": "Cardiology",
    "hospital": "City Hospital",
    "address": "New MG Road, Indore"
  }'
```

### 3.5 Toggle Doctor Status
```bash
curl -X PATCH "http://localhost:3000/api/admin/doctors/{{DOCTOR_ID}}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -d '{ "is_active": false }'
```

---

## 4. Admin — Reports (`/api/admin/reports`)

### 4.1 Create Report (multipart)
```bash
curl -X POST "http://localhost:3000/api/admin/reports" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -F "file=@/path/to/report.pdf" \
  -F "report_name=CBC Report" \
  -F "sample_date=2026-04-20" \
  -F "reg_no=REG-1001" \
  -F "lab_no=LAB-1001" \
  -F "patient_name=Suresh Kumar" \
  -F "age=45" \
  -F "sex=male" \
  -F "referred_by_doctor_id={{DOCTOR_ID}}" \
  -F "referred_by_self=false" \
  -F "panel=Haematology" \
  -F "investigation=Complete Blood Count" \
  -F "status=completed"
```

### 4.2 List Reports
```bash
curl -X GET "http://localhost:3000/api/admin/reports?q=suresh&status=completed&page=1&limit=20&sort_by=created_at&sort_dir=desc" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

### 4.3 Get Report by ID
```bash
curl -X GET "http://localhost:3000/api/admin/reports/{{REPORT_ID}}" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

### 4.4 Update Report (multipart, optional file)
```bash
curl -X PUT "http://localhost:3000/api/admin/reports/{{REPORT_ID}}" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -F "file=@/path/to/updated-report.pdf" \
  -F "report_name=CBC Report (Revised)" \
  -F "status=completed"
```

### 4.5 Update Report Status
```bash
curl -X PATCH "http://localhost:3000/api/admin/reports/{{REPORT_ID}}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -d '{ "status": "completed" }'
```

### 4.6 Download Report
```bash
curl -X GET "http://localhost:3000/api/admin/reports/{{REPORT_ID}}/download" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -OJ
```

---

## 5. Admin — Referrals (`/api/admin/referrals`)

### 5.1 List All Referrals
```bash
curl -X GET "http://localhost:3000/api/admin/referrals?q=suresh&doctor_id={{DOCTOR_ID}}&page=1&limit=20" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

---

## 6. Doctor Panel (`/api/doctor`)

### 6.1 Refer Patient
```bash
curl -X POST "http://localhost:3000/api/doctor/refer-patient" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{DOCTOR_TOKEN}}" \
  -d '{
    "name": "Suresh Kumar",
    "age": 45,
    "sex": "male",
    "phone": "9988776655",
    "email": "suresh@example.com",
    "address": "A-12, Vijay Nagar, Indore",
    "notes": "Fasting required for sample"
  }'
```

### 6.2 My Referrals
```bash
curl -X GET "http://localhost:3000/api/doctor/my-referrals?q=suresh&page=1&limit=20" \
  -H "Authorization: Bearer {{DOCTOR_TOKEN}}"
```

### 6.3 List My Reports
```bash
curl -X GET "http://localhost:3000/api/doctor/reports?q=cbc&status=completed&page=1&limit=20" \
  -H "Authorization: Bearer {{DOCTOR_TOKEN}}"
```

### 6.4 Get Report by ID (doctor)
```bash
curl -X GET "http://localhost:3000/api/doctor/reports/{{REPORT_ID}}" \
  -H "Authorization: Bearer {{DOCTOR_TOKEN}}"
```

### 6.5 Download Report (doctor)
```bash
curl -X GET "http://localhost:3000/api/doctor/reports/{{REPORT_ID}}/download" \
  -H "Authorization: Bearer {{DOCTOR_TOKEN}}" \
  -OJ
```
