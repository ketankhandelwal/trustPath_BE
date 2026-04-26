console.log('[utils/asyncHandler] Loading async error wrapper');

const asyncHandler = (fn) => (req, res, next) => {
  console.log('[asyncHandler] Wrapping handler for', req.method, req.originalUrl);
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log('[asyncHandler] Caught error:', err.message);
    next(err);
  });
};

module.exports = asyncHandler;
