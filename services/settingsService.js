// services/settingsService.js
<<<<<<< HEAD
const { getClient } = require('../db/database');

const SETTINGS_KEY = 'bot_settings';

/**
 * 🧩 Pastikan key 'bot_settings' bertipe hash agar tidak error WRONGTYPE
 */
async function ensureSettingsHash(client) {
  try {
    const type = await client.type(SETTINGS_KEY);
    if (type !== 'hash' && type !== 'none') {
      console.warn(`⚠️ Key '${SETTINGS_KEY}' bertipe ${type}, bukan hash — melakukan reset...`);
      await client.del(SETTINGS_KEY);
      console.log(`✅ Key '${SETTINGS_KEY}' direset sebagai hash`);
    }
  } catch (err) {
    console.error('❌ ensureSettingsHash() error:', err);
  }
}

/**
 * 🔍 Ambil setting dari Redis
 */
async function getSetting(key) {
  const client = getClient();
  if (!client) {
    console.error('❌ Redis client belum terhubung!');
    return null;
  }

  await ensureSettingsHash(client);

  const val = await client.hGet(SETTINGS_KEY, key);
  return val || null;
=======
const { getClient } = require('../db/database'); // pastikan ambil client dari modul database.js

const SETTINGS_KEY = 'bot_settings';

async function getSetting(key) {
  const client = getClient(); // pastikan ambil client aktif
  if (!client) {
    console.error('❌ Redis client belum terhubung!');
    return null;
  }
  const val = await client.hGet(SETTINGS_KEY, key);
  return val;
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
}

/**
 * 💾 Simpan atau update setting ke Redis
 */
async function setSetting(key, value) {
  const client = getClient();
  if (!client) {
    console.error('❌ Redis client belum terhubung!');
    return;
  }
<<<<<<< HEAD

  await ensureSettingsHash(client);

  await client.hSet(SETTINGS_KEY, key, String(value));
  console.log(`✅ Setting '${key}' disimpan: ${value}`);
=======
  await client.hSet(SETTINGS_KEY, key, value);
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
}

module.exports = {
  getSetting,
  setSetting,
};
