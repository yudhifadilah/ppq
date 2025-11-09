// bot/index.js
const { Telegraf } = require('telegraf');
const userHandler = require('./handlers/userHandler');
const adminHandler = require('./handlers/adminHandler');
const uploadHandler = require('./handlers/uploadHandler');
const fsmHandler = require('./handlers/fsmHandler');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN required');
const bot = new Telegraf(BOT_TOKEN);

const ADMIN_IDS = (process.env.ADMIN_IDS || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

function isAdmin(ctx) {
  return ADMIN_IDS.includes(String(ctx.from?.id));
}

// Commands
bot.start((ctx) => userHandler.start(ctx, isAdmin(ctx)));
bot.action('VIEW_PRODUCTS', (ctx) => userHandler.viewProducts(ctx));
bot.action('BUY_PRODUCT', (ctx) => userHandler.buyProduct(ctx));

// Admin area
bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Kamu bukan admin!');
  await adminHandler.showAdminMenu(ctx);
});

// Upload & FSM
bot.on('photo', (ctx) => uploadHandler.handleUpload(ctx));
bot.on('text', (ctx) => fsmHandler.handleState(ctx));

// Catch-all error logger
bot.catch((err, ctx) => {
  console.error('❌ Unhandled bot error', err);
});

module.exports = bot;
