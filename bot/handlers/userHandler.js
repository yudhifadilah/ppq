const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');
const { client } = require('../../db/database');
const { mainMenu } = require('../keyboards');

async function start(ctx) {
  const greeting = await settingsService.getSetting('greeting', `Selamat datang di toko kami!`);
  const help = await settingsService.getSetting('help', 'Gunakan menu untuk berbelanja');
  await ctx.reply(`${greeting}\n\n${help}`, mainMenu(false));
}

async function viewProducts(ctx) {
  const products = await productService.listProducts();
  if (!products.length) return ctx.reply('Belum ada produk.');
  for (const p of products) {
    await ctx.reply(`*${p.name}*\nHarga: ${p.price}\nStok: ${p.stock}\n${p.description}\n\nGunakan /kb_${p.id} untuk beli.`, { parse_mode: 'Markdown' });
  }
}

async function buyCommand(ctx, id) {
  const p = await productService.getProduct(id);
  if (!p) return ctx.reply('Produk tidak ditemukan');
  const orderId = `ORD-${Date.now()}`;
  const items = [{ productId: p.id, name: p.name, qty: 1, price: p.price }];
  await orderService.createOrder({ id: orderId, userId: ctx.from.id, items, total: p.price });
  await ctx.reply(`Order dibuat: ${orderId}\nTotal: ${p.price}\nSilakan upload bukti pembayaran dengan mengirim foto dan tuliskan ID order pada caption (mis: ${orderId})`);
  // notify admins
  const adminIds = (process.env.ADMIN_IDS || '').split(',').filter(Boolean).map(x => Number(x));
  const inline = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Approve', callback_data: `admin_approve|${orderId}` }, { text: 'Reject', callback_data: `admin_reject|${orderId}` }]
      ]
    }
  };
  for (const aid of adminIds) {
    try {
      await ctx.telegram.sendMessage(aid, `📥 Order baru: ${orderId}\nUser: ${ctx.from.username || ctx.from.first_name || ctx.from.id}\nTotal: ${p.price}`, inline);
    } catch (e) {
      console.error('Notify admin error', e);
    }
  }
}

async function trackingStart(ctx) {
  await ctx.reply('Silakan masukkan nomor order untuk tracking:');
  await client.hSet(`user:${ctx.from.id}`, 'state', 'AWAITING_TRACK_ID');
}

module.exports = { start, viewProducts, buyCommand, trackingStart };
