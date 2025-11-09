// bot/handlers/fsmHandler.js
const { getClient } = require('../../db/database');

module.exports = {
  async handleState(ctx) {
    const client = getClient();
    if (!client) return ctx.reply('⚠️ Database belum siap, coba lagi.');
    // lanjutkan FSM seperti biasa
  },
};
