console.log('[utils/apiResponse] Loading response helpers');

const success = (res, statusCode, message, data = null) => {
  console.log('[apiResponse.success] status:', statusCode, 'message:', message);
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, statusCode, message, details = null) => {
  console.log('[apiResponse.error] status:', statusCode, 'message:', message);
  if (details) console.log('[apiResponse.error] details:', details);
  return res.status(statusCode).json({
    success: false,
    message,
    errors: details,
  });
};

module.exports = { success, error };
