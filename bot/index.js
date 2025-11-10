// bot/index.js
<<<<<<< HEAD
const { Telegraf, session } = require('telegraf');
=======
const { Telegraf } = require('telegraf');
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
const userHandler = require('./handlers/userHandler');
const adminHandler = require('./handlers/adminHandler');
const uploadHandler = require('./handlers/uploadHandler');
const fsmHandler = require('./handlers/fsmHandler');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN required');
const bot = new Telegraf(BOT_TOKEN);

<<<<<<< HEAD

bot.use(session());
// 🧑‍💼 List admin dari .env
const ADMIN_IDS = (process.env.ADMIN_IDS || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

function isAdmin(ctx) {
  return ADMIN_IDS.includes(String(ctx.from?.id));
}

/* ===================================
   👥 USER COMMANDS & MENU UTAMA
=================================== */

// /start command — tampilkan menu utama
bot.start(async (ctx) => {
  try {
    await userHandler.start(ctx, isAdmin(ctx));
  } catch (err) {
    console.error('❌ Error in /start:', err);
  }
});

// tombol utama user
bot.action('VIEW_PRODUCTS', async (ctx) => {
  try {
    await userHandler.viewProducts(ctx);
  } catch (err) {
    console.error('❌ VIEW_PRODUCTS error:', err);
  }
});

bot.action(/^VIEW_DETAIL_/, async (ctx) => {
  try {
    await userHandler.viewProductDetail(ctx);
  } catch (err) {
    console.error('❌ VIEW_DETAIL error:', err);
  }
});

bot.action(/^OPEN_LINK_/, async (ctx) => {
  try {
    await userHandler.openRandomLink(ctx);
  } catch (err) {
    console.error('❌ OPEN_LINK error:', err);
  }
});

bot.action('BUY_PRODUCT', async (ctx) => {
  try {
    await userHandler.buyProduct(ctx);
  } catch (err) {
    console.error('❌ BUY_PRODUCT error:', err);
  }
});

bot.action('TRACK_ORDER', async (ctx) => {
  try {
    await userHandler.trackOrder(ctx);
  } catch (err) {
    console.error('❌ TRACK_ORDER error:', err);
  }
});

// command manual tracking
bot.command('tracking', async (ctx) => {
  try {
    await userHandler.trackOrder(ctx);
  } catch (err) {
    console.error('❌ /tracking error:', err);
  }
});

/* ===================================
   🛠 ADMIN PANEL & ACTIONS
=================================== */

// Tombol "Admin Panel" dari menu utama
bot.action('ADMIN_PANEL', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Kamu bukan admin!');
  try {
    await adminHandler.showAdminMenu(ctx);
  } catch (err) {
    console.error('❌ ADMIN_PANEL error:', err);
  }
});

// Command manual: /admin
bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Kamu bukan admin!');
  try {
    await adminHandler.showAdminMenu(ctx);
  } catch (err) {
    console.error('❌ /admin error:', err);
  }
});

// Tombol-tombol di panel admin
bot.action('ADMIN_ADD_PRODUCT', (ctx) => adminHandler.addProduct(ctx));
bot.action('ADMIN_DELETE_PRODUCT', (ctx) => adminHandler.deleteProduct(ctx));
bot.action('ADMIN_LIST_ORDERS', (ctx) => adminHandler.listOrders(ctx));
bot.action('ADMIN_CONFIRM_PAYMENT', (ctx) => adminHandler.confirmPayment(ctx));
bot.action('ADMIN_SET_RESI', (ctx) => adminHandler.setResi(ctx));
bot.action('ADMIN_SET_STATUS', (ctx) => adminHandler.setStatus(ctx));
bot.action('ADMIN_SET_GREETING', (ctx) => adminHandler.setGreeting(ctx));

/* ===================================
   🧾 UPLOAD & FSM INPUT HANDLER
=================================== */
bot.on('photo', (ctx) => {
  try {
    uploadHandler.handleUpload(ctx);
  } catch (err) {
    console.error('❌ Upload error:', err);
  }
});

bot.on('text', (ctx) => {
  try {
    fsmHandler.handleState(ctx);
  } catch (err) {
    console.error('❌ FSM error:', err);
  }
});

/* ===================================
   ⚠️ GLOBAL ERROR HANDLER
=================================== */

bot.catch((err, ctx) => {
  console.error('❌ Unhandled bot error:', err);
=======
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
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
});

module.exports = bot;
