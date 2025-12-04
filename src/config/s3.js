const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let s3Client = null;

if (bucketName && region && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

const uploadImageToS3 = async (buffer, key, contentType) => {
  if (!s3Client) {
    throw new Error('AWS S3 is not configured correctly');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error uploading image to S3:', error);
    throw error;
  }

  const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com`;
  return `${baseUrl}/${encodeURIComponent(key)}`;
};

module.exports = { uploadImageToS3 };


