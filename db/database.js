// db/database.js
const { createClient } = require('redis');

let client;

async function connect() {
  console.log('✅ Redis connecting...');
  client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: process.env.REDIS_URL.startsWith('rediss://'),
      rejectUnauthorized: false, // penting untuk SSL (Leapcell pakai rediss)
    },
  });

  client.on('error', (err) => console.error('Redis error:', err));
  client.on('ready', () => console.log('✅ Redis ready!'));

  await client.connect();
  console.log('🚀 Redis connected successfully');
  return client;
}

function getClient() {
  return client;
}

module.exports = { connect, getClient };
