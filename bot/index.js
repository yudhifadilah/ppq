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

/* =======================
   ✅ USER COMMANDS
   ======================= */
bot.start((ctx) => userHandler.start(ctx, isAdmin(ctx)));
bot.action('VIEW_PRODUCTS', (ctx) => userHandler.viewProducts(ctx));
bot.action('BUY_PRODUCT', (ctx) => userHandler.buyProduct(ctx));
bot.action('TRACK_ORDER', (ctx) => userHandler.trackOrder(ctx)); // ✅ added

/* =======================
   👑 ADMIN COMMANDS
   ======================= */
bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Kamu bukan admin!');
  await adminHandler.showAdminMenu(ctx);
});

// ✅ handle all admin inline actions
bot.action('ADMIN_PANEL', (ctx) => adminHandler.showAdminMenu(ctx));
bot.action('ADMIN_ADD_PRODUCT', (ctx) => adminHandler.addProduct(ctx));
bot.action('ADMIN_DELETE_PRODUCT', (ctx) => adminHandler.deleteProduct(ctx));
bot.action('ADMIN_CONFIRM_PAYMENT', (ctx) => adminHandler.confirmPayment(ctx));
bot.action('ADMIN_INPUT_RESI', (ctx) => adminHandler.inputResi(ctx));
bot.action('ADMIN_UPDATE_STATUS', (ctx) => adminHandler.updateStatus(ctx));
bot.action('ADMIN_EDIT_TEXTS', (ctx) => adminHandler.editTexts(ctx));

/* =======================
   📸 UPLOAD & FSM
   ======================= */
bot.on('photo', (ctx) => uploadHandler.handleUpload(ctx));
bot.on('text', (ctx) => fsmHandler.handleState(ctx));

/* =======================
   🧠 GLOBAL CALLBACK LOGGER
   ======================= */
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery?.data;
  console.log('📩 Callback received:', data);
  await ctx.answerCbQuery(); // stop Telegram spinner
});

/* =======================
   🧯 ERROR HANDLER
   ======================= */
bot.catch((err, ctx) => {
  console.error('❌ Unhandled bot error', err);
});

module.exports = bot;
