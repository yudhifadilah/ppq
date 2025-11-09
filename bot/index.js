const { Telegraf } = require('telegraf');
const userHandler = require('./handlers/userHandler');
const adminHandler = require('./handlers/adminHandler');
const uploadHandler = require('./handlers/uploadHandler');
const fsmHandler = require('./handlers/fsmHandler');
const { mainMenu } = require('./keyboards');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN required');
const bot = new Telegraf(BOT_TOKEN);

const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').filter(Boolean).map(x => Number(x));

bot.start(async (ctx) => userHandler.start(ctx));

bot.command('lihat_produk', async (ctx) => userHandler.viewProducts(ctx));

bot.command('tracking', async (ctx) => userHandler.trackingStart(ctx));

bot.command('upload', async (ctx) => ctx.reply('Silakan kirim foto bukti pembayaran dengan caption ID order (mis: ORD-12345)'));

// Admin-only commands
bot.command('admin', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  return adminHandler.adminPanel(ctx);
});

bot.command('addproduct', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  const args = ctx.message.text.split(' ').slice(1);
  return adminHandler.addProductCmd(ctx, args);
});

bot.command('deleteproduct', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  const args = ctx.message.text.split(' ').slice(1);
  return adminHandler.deleteProductCmd(ctx, args[0]);
});

bot.command('listproducts', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  return adminHandler.listProductsCmd(ctx);
});

bot.command('listorders', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  return adminHandler.listOrdersCmd(ctx);
});

bot.command('confirmpayment', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  const args = ctx.message.text.split(' ').slice(1);
  if (!args[0]) return ctx.reply('Gunakan: /confirmpayment ORD-...');
  return adminHandler.confirmPayment(ctx, args[0]);
});

bot.command('setresi', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  const args = ctx.message.text.split(' ').slice(1);
  return adminHandler.setResi(ctx, args);
});

bot.command('setstatus', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  const args = ctx.message.text.split(' ').slice(1);
  return adminHandler.setStatus(ctx, args);
});

bot.command('setgreeting', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Hanya admin.');
  const args = ctx.message.text.split(' ').slice(1);
  return adminHandler.setGreeting(ctx, args);
});

// handle photo/document uploads
bot.on(['photo', 'document'], async (ctx) => {
  try { await uploadHandler.handleUpload(ctx); } catch (e) { console.error(e); ctx.reply('Error saat upload.'); }
});

// callback queries
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data || '';
  // admin inline approval
  if (data.startsWith('admin_')) {
    const parts = data.split('|');
    const action = parts[0]; // admin_approve or admin_reject
    const orderId = parts[1];
    if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.answerCbQuery('Hanya admin');
    if (action === 'admin_approve') {
      await require('../services/orderService').updateOrder(orderId, { status: 'paid' });
      try { await ctx.editMessageReplyMarkup(); } catch(e){}
      await ctx.reply(`Order ${orderId} disetujui.`);
      const ord = await require('../services/orderService').getOrder(orderId);
      if (ord && ord.userId) {
        try { await ctx.telegram.sendMessage(Number(ord.userId), `📣 Order ${orderId} telah dikonfirmasi oleh admin. Status: paid`); } catch(e){}
      }
      return ctx.answerCbQuery('Diapprove');
    }
    if (action === 'admin_reject') {
      await require('../services/orderService').updateOrder(orderId, { status: 'payment_rejected' });
      try { await ctx.editMessageReplyMarkup(); } catch(e){}
      await ctx.reply(`Order ${orderId} ditolak.`);
      const ord = await require('../services/orderService').getOrder(orderId);
      if (ord && ord.userId) {
        try { await ctx.telegram.sendMessage(Number(ord.userId), `⚠️ Order ${orderId} pembayaran ditolak oleh admin.`); } catch(e){}
      }
      return ctx.answerCbQuery('Ditolak');
    }
  }

  if (data === 'VIEW_PRODUCTS') return userHandler.viewProducts(ctx);
  if (data === 'TRACK_ORDER') return userHandler.trackingStart(ctx);
  if (data === 'ADMIN_PANEL') return adminHandler.adminPanel(ctx);
  if (data.startsWith('kb_')) return userHandler.buyCommand(ctx, data.slice(3));
  return ctx.answerCbQuery();
});

// text fallback -> FSM
bot.on('text', async (ctx) => {
  const handled = await fsmHandler.handleTextState(ctx, ctx.message.text);
  if (handled) return;
  const m = ctx.message.text.match(/\/kb_(\S+)/);
  if (m) return userHandler.buyCommand(ctx, m[1]);
  await ctx.reply('Perintah tidak dikenal. Ketik /start');
});

module.exports = bot;
