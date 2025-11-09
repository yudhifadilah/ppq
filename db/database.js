const { createClient } = require('redis');

let client;

async function connect() {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL || 'rediss://default:Ae00000K+YGVhpO84qQ2z7xVxybbDgUnPCEM/frnvMY/hQf8dXKIQGMvYPupOBR0Z15ieur@db-pevk-gffc-178851.leapcell.cloud:6379';

  const isSecure = redisUrl.startsWith('rediss://');

  client = createClient({
    url: redisUrl,
    socket: isSecure
      ? {
          tls: true,
          rejectUnauthorized: false, // penting untuk Leapcell (sertifikat self-signed)
        }
      : {},
  });

  client.on('error', (err) => console.error('❌ Redis Client Error', err));
  client.on('connect', () => console.log('✅ Redis connecting...'));
  client.on('ready', () => console.log('✅ Redis ready!'));

  await client.connect();
  console.log('🚀 Redis connected successfully');

  return client;
}

module.exports = { connect };
