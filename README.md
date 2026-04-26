# Nidan Pathology – Backend

Node 22 + Express + PostgreSQL (viewed via pgAdmin) + raw SQL queries + JWT auth + Joi validation.
Sequelize is used **only** for migrations (`npx sequelize db:migrate`). All runtime queries are raw SQL via the `pg` driver.

## Stack

| Layer       | Choice                                   |
| ----------- | ---------------------------------------- |
| Runtime     | Node.js 22                               |
| Framework   | Express 4                                |
| Database    | PostgreSQL (admin with pgAdmin)          |
| Data access | Raw SQL via `pg` (connection pool)       |
| Migrations  | Sequelize CLI (models not used)          |
| Auth        | JWT (Bearer token)                       |
| Validation  | Joi                                      |
| Uploads     | multer (PDF / PNG / DOC / DOCX)          |

## Folder structure

```
pathLab_BE/
├── app.js                     # Express app wiring
├── bin/www                    # HTTP bootstrap
├── .env                       # Local env (not committed)
├── .env.example               # Sample env
├── .sequelizerc               # Points Sequelize CLI at src/migrations
├── package.json
├── src/
│   ├── config/
│   │   ├── database.js        # Sequelize CLI config (migrations only)
│   │   └── db.js              # pg Pool + query() helper for raw SQL
│   ├── migrations/            # `npx sequelize db:migrate` runs these
│   ├── middlewares/
│   │   ├── auth.js            # JWT authentication (admin / doctor)
│   │   ├── errorHandler.js    # 404 + global error handler
│   │   ├── upload.js          # multer upload (PDF/PNG/Word)
│   │   └── validate.js        # Joi validation middleware
│   ├── validators/            # Joi schemas
│   ├── services/              # Business logic (raw SQL)
│   ├── controllers/           # Express handlers
│   ├── routes/                # Route registration
│   └── utils/                 # jwt, password, apiResponse, asyncHandler
└── uploads/                   # Local file storage (auto-created)
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Postgres database in pgAdmin (default: `pathlab_db`).
3. Copy `.env.example` → `.env` and fill DB creds + `JWT_SECRET`.
4. Run migrations (creates tables + seeds default admin):
   ```bash
   npx sequelize db:migrate
   ```
   Default admin (change after first login):
   - email: `admin@nidanpathology.com`
   - password: `Admin@123`
5. Start the dev server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

Server runs on `http://localhost:3000`. API base path: `/api`.

## API overview

### Auth (`/api/auth`)
| Method | Path                      | Who    | Purpose                  |
| ------ | ------------------------- | ------ | ------------------------ |
| POST   | `/admin/login`            | public | Admin login              |
| POST   | `/doctor/login`           | public | Doctor login             |
| POST   | `/admin/change-password`  | admin  | Change admin password    |
| POST   | `/doctor/change-password` | doctor | Change doctor password   |
| POST   | `/logout`                 | any    | Stateless ack            |
| GET    | `/me`                     | any    | Current user profile     |

### Admin – Doctors (`/api/admin/doctors`)
| Method | Path           | Purpose                                       |
| ------ | -------------- | --------------------------------------------- |
| POST   | `/`            | Add doctor (creates login_id + password)      |
| GET    | `/`            | List/search/filter (reports + referrals count) |
| GET    | `/:id`         | Doctor details                                |
| PUT    | `/:id`         | Edit doctor                                   |
| PATCH  | `/:id/status`  | Activate/deactivate                           |

### Admin – Reports (`/api/admin/reports`)
Accepts `multipart/form-data` with field `file` (PDF / PNG / DOC / DOCX).

| Method | Path              | Purpose                        |
| ------ | ----------------- | ------------------------------ |
| POST   | `/`               | Upload report                  |
| GET    | `/`               | List/search/filter by status   |
| GET    | `/:id`            | Report details                 |
| PUT    | `/:id`            | Edit report (replace file opt) |
| PATCH  | `/:id/status`     | Update status only             |
| GET    | `/:id/download`   | Download report file           |

### Admin – Referrals (`/api/admin/referrals`)
| Method | Path | Purpose                                |
| ------ | ---- | -------------------------------------- |
| GET    | `/`  | List all patient referrals (searchable) |

### Doctor panel (`/api/doctor`)
| Method | Path                     | Purpose                             |
| ------ | ------------------------ | ----------------------------------- |
| POST   | `/refer-patient`         | Refer patient                       |
| GET    | `/my-referrals`          | List my referred patients           |
| GET    | `/reports`               | List reports shared to this doctor  |
| GET    | `/reports/:id`           | View report details                 |
| GET    | `/reports/:id/download`  | Download report file                |

A deactivated doctor receives `403` with message:
`"Admin ne aapka account remove kar diya hai, please Nidan Pathology se contact karein."`

## Report statuses
`completed` | `incomplete` | `in_progress`

## Scripts
```bash
npm run dev              # nodemon
npm start                # node bin/www
npm run migrate          # npx sequelize db:migrate
npm run migrate:undo     # rollback last migration
npm run migrate:undo:all # rollback everything
```
