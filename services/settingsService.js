const { client } = require('../db/database');
const SETTINGS_KEY = 'settings';

async function getSetting(key, fallback = null) {
  const val = await client.hGet(SETTINGS_KEY, key);
  return val ?? fallback;
}

async function setSetting(key, value) {
  await client.hSet(SETTINGS_KEY, key, String(value));
}

module.exports = { getSetting, setSetting };
