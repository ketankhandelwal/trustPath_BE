console.log('[utils/s3] Loading S3 helper utilities');

const path = require('path');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const {
  s3Client,
  BUCKET,
  REPORTS_PREFIX,
  PRESIGNED_EXPIRES,
} = require('../config/s3');

const buildReportKey = (originalName) => {
  console.log('[utils/s3.buildReportKey] originalName:', originalName);
  const ext = path.extname(originalName || '');
  const base = path
    .basename(originalName || 'file', ext)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 60);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const key = `${REPORTS_PREFIX}/${base}-${unique}${ext}`;
  console.log('[utils/s3.buildReportKey] generated key:', key);
  return key;
};

const uploadBufferToS3 = async (file, keyOverride) => {
  console.log('[utils/s3.uploadBufferToS3] uploading:', file && file.originalname);
  if (!file || !file.buffer) {
    console.log('[utils/s3.uploadBufferToS3] no file buffer provided');
    throw new Error('No file buffer to upload');
  }
  const Key = keyOverride || buildReportKey(file.originalname);
  console.log('[utils/s3.uploadBufferToS3] Key:', Key, 'Bucket:', BUCKET);

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: `inline; filename="${file.originalname}"`,
  });
  await s3Client.send(cmd);
  console.log('[utils/s3.uploadBufferToS3] upload complete');

  return {
    key: Key,
    bucket: BUCKET,
    size: file.size,
    mimetype: file.mimetype,
    originalName: file.originalname,
  };
};

const getPresignedDownloadUrl = async (key, downloadFilename) => {
  console.log('[utils/s3.getPresignedDownloadUrl] key:', key, 'dl name:', downloadFilename);
  if (!key) {
    console.log('[utils/s3.getPresignedDownloadUrl] key missing');
    throw new Error('S3 key required for presigned URL');
  }
  const cmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: downloadFilename
      ? `attachment; filename="${downloadFilename}"`
      : undefined,
  });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: PRESIGNED_EXPIRES });
  console.log('[utils/s3.getPresignedDownloadUrl] signed url generated, expires in:', PRESIGNED_EXPIRES);
  return url;
};

const getPresignedInlineUrl = async (key) => {
  console.log('[utils/s3.getPresignedInlineUrl] key:', key);
  if (!key) return null;
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: PRESIGNED_EXPIRES });
  console.log('[utils/s3.getPresignedInlineUrl] signed url generated');
  return url;
};

const deleteFromS3 = async (key) => {
  console.log('[utils/s3.deleteFromS3] key:', key);
  if (!key) return;
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log('[utils/s3.deleteFromS3] deleted');
  } catch (err) {
    console.log('[utils/s3.deleteFromS3] delete failed (non-fatal):', err.message);
  }
};

module.exports = {
  buildReportKey,
  uploadBufferToS3,
  getPresignedDownloadUrl,
  getPresignedInlineUrl,
  deleteFromS3,
};
