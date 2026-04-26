require('dotenv').config();
console.log('[app] Bootstrapping Express app for Nidan Pathology BE');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const apiRouter = require('./src/routes');
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
console.log('[app] Express instance created');

app.use(cors());
console.log('[app] CORS enabled');

app.use(morgan('dev'));
console.log('[app] morgan logger attached');

app.use(express.json({ limit: '5mb' }));
console.log('[app] JSON body parser attached');

app.use(express.urlencoded({ extended: true }));
console.log('[app] URL-encoded parser attached');

app.use(cookieParser());
console.log('[app] Cookie parser attached');
console.log('[app] Report files served from S3 (no local /uploads static mount)');

app.get('/', (req, res) => {
  console.log('[app] GET / hit');
  res.status(200).json({
    success: true,
    message: 'Nidan Pathology API is running',
    docs: '/api/health',
  });
});
console.log('[app] GET / registered');

app.use('/api', apiRouter);
console.log('[app] /api router mounted');

app.use(notFound);
console.log('[app] 404 handler attached');

app.use(errorHandler);
console.log('[app] Global error handler attached');

module.exports = app;
