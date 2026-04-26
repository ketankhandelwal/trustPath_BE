console.log('[middlewares/validate] Loading Joi validation middleware');

const { error } = require('../utils/apiResponse');

const validate = (schema, source = 'body') => (req, res, next) => {
  console.log('[middlewares/validate] Validating', source, 'for', req.method, req.originalUrl);
  const payload = req[source];
  console.log('[middlewares/validate] Payload keys:', Object.keys(payload || {}));
  const { error: validationError, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (validationError) {
    console.log('[middlewares/validate] Validation failed');
    const details = validationError.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return error(res, 422, 'Validation failed', details);
  }
  console.log('[middlewares/validate] Validation passed');
  req[source] = value;
  return next();
};

module.exports = validate;
