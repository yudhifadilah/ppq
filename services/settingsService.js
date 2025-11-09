// services/settingsService.js
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
}

async function setSetting(key, value) {
  const client = getClient();
  if (!client) {
    console.error('❌ Redis client belum terhubung!');
    return;
  }
  await client.hSet(SETTINGS_KEY, key, value);
}

module.exports = {
  getSetting,
  setSetting,
};
