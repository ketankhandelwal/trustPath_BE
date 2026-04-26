console.log('[middlewares/errorHandler] Loading global error handler');

const { error } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.log('[errorHandler] Incoming error:', err.message);
  console.log('[errorHandler] Stack:', err.stack);
  const status = err.status || err.statusCode || 500;
  console.log('[errorHandler] Responding with status:', status);
  return error(res, status, err.message || 'Internal Server Error');
};

const notFound = (req, res, next) => {
  console.log('[errorHandler.notFound] No route for', req.method, req.originalUrl);
  return error(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

module.exports = { errorHandler, notFound };
