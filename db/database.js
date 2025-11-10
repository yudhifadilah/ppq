// db/database.js
const { createClient } = require('redis');

let client;

async function connect() {
  if (client) return client;

  console.log('✅ Redis connecting...');

  // Ambil URL Redis dari environment
  let redisUrl =
    process.env.REDIS_URL ||
<<<<<<< HEAD
    'rediss://default:Ae00000hdzIOsfvlpIoSzp26eaaLL6FzsmKHObJHwQemRKVFXSTGyl3f/CQy3fvQorWlCCQ@db-gtmc-hggg-109314.leapcell.cloud:6379';

  // Encode password agar simbol (+, /, dll) tidak bikin URL invalid
=======
    'rediss://default:Ae00000K+YGVhpO84qQ2z7xVxybbDgUnPCEM/frnvMY/hQf8dXKIQGMvYPupOBR0Z15ieur@db-pevk-gffc-178851.leapcell.cloud:6379';

  // --- FIX: encode password agar karakter khusus (/, +, dll) tidak bikin URL invalid ---
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
  if (redisUrl.includes('@')) {
    const parts = redisUrl.split('@');
    const auth = parts[0].replace('rediss://', '');
    const [user, pass] = auth.split(':');
    const encodedPass = encodeURIComponent(pass);
    redisUrl = `rediss://${user}:${encodedPass}@${parts[1]}`;
  }

  const isSecure = redisUrl.startsWith('rediss://');

  try {
    client = createClient({
      url: redisUrl,
      socket: isSecure
        ? {
            tls: true,
<<<<<<< HEAD
            rejectUnauthorized: false, // untuk Leapcell (self-signed cert)
=======
            rejectUnauthorized: false, // penting untuk Leapcell
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
          }
        : {},
    });

    client.on('error', (err) => console.error('❌ Redis Client Error:', err));
    client.on('connect', () => console.log('✅ Redis connecting...'));
    client.on('ready', () => console.log('✅ Redis ready!'));

    await client.connect();
    console.log('🚀 Redis connected successfully');

    return client;
  } catch (err) {
    console.error('❌ Initialization failed:', err);
    throw err;
  }
}

<<<<<<< HEAD
/**
 * Pastikan client sudah terkoneksi.
 */
function getClient() {
  if (!client) {
    throw new Error('❌ Redis client belum terhubung! Panggil connect() dulu.');
  }
=======
function getClient() {
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
  return client;
}

module.exports = { connect, getClient };
