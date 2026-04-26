require('dotenv').config();
console.log('[config/s3] Initializing S3 client');

const { S3Client } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION || 'ap-southeast-1';
console.log('[config/s3] AWS_REGION:', REGION);

const BUCKET = process.env.S3_BUCKET_NAME;
console.log('[config/s3] S3_BUCKET_NAME:', BUCKET);

const REPORTS_PREFIX = (process.env.S3_REPORTS_PREFIX || 'pathlab/reports').replace(/^\/+|\/+$/g, '');
console.log('[config/s3] S3_REPORTS_PREFIX:', REPORTS_PREFIX);

const PRESIGNED_EXPIRES = Number(process.env.S3_PRESIGNED_URL_EXPIRES) || 900;
console.log('[config/s3] PRESIGNED_EXPIRES (sec):', PRESIGNED_EXPIRES);

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('[config/s3] WARNING: AWS credentials missing in env');
}
if (!BUCKET) {
  console.log('[config/s3] WARNING: S3_BUCKET_NAME missing in env');
}

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
console.log('[config/s3] S3Client created');

module.exports = {
  s3Client,
  BUCKET,
  REGION,
  REPORTS_PREFIX,
  PRESIGNED_EXPIRES,
};
