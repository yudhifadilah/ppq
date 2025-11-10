// bot/handlers/adminHandler.js
const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');
const { Markup } = require('telegraf');

<<<<<<< HEAD
/* ===========================
   🧭 Menu utama admin
=========================== */
async function showAdminMenu(ctx) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '➕ Tambah Produk', callback_data: 'ADMIN_ADD_PRODUCT' }],
      [{ text: '❌ Hapus Produk', callback_data: 'ADMIN_DELETE_PRODUCT' }],
      [{ text: '📦 Daftar Order', callback_data: 'ADMIN_LIST_ORDERS' }],
      [{ text: '💳 Konfirmasi Pembayaran', callback_data: 'ADMIN_CONFIRM_PAYMENT' }],
      [{ text: '🚚 Input Resi', callback_data: 'ADMIN_SET_RESI' }],
      [{ text: '🔄 Ubah Status Order', callback_data: 'ADMIN_SET_STATUS' }],
      [{ text: '💬 Ubah Greeting', callback_data: 'ADMIN_SET_GREETING' }]
    ],
  };
  await ctx.reply('📋 Panel Admin:', { reply_markup: keyboard });
}

/* ===========================
   🧱 Tombol aksi Admin
=========================== */
async function addProduct(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingAddProduct = true;
  await ctx.reply('🧾 Kirim data produk dalam format:\n\n`id|nama|harga|stok|deskripsi`', { parse_mode: 'Markdown' });
}

async function deleteProduct(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingDeleteProduct = true;
  await ctx.reply('🗑 Kirim ID produk yang ingin dihapus:');
}

async function listOrders(ctx) {
  const orders = await orderService.listOrders();
  if (!orders.length) return ctx.reply('Belum ada order');
  for (const o of orders) {
    await ctx.reply(`📦 *${o.id}*\nUser: ${o.userId}\nStatus: ${o.status}\nTotal: ${o.total}`, { parse_mode: 'Markdown' });
  }
}

async function confirmPayment(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingConfirmOrder = true;
  await ctx.reply('Kirim ID order untuk dikonfirmasi pembayarannya (contoh: ORD-1234)');
}

async function setResi(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSetResi = true;
  await ctx.reply('Kirim data dalam format:\n\n`ORD-...|nomor_resi`', { parse_mode: 'Markdown' });
}

async function setStatus(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSetStatus = true;
  await ctx.reply('Kirim data dalam format:\n\n`ORD-...|status`', { parse_mode: 'Markdown' });
}

async function setGreeting(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSetGreeting = true;
  await ctx.reply('Kirim teks greeting baru:');
}

/* ===========================
   🧩 Ekspor
=========================== */
module.exports = {
  showAdminMenu,
  addProduct,
  deleteProduct,
  listOrders,
=======
/* ======================
   📋 Inline Admin Panel
   ====================== */
async function showAdminMenu(ctx) {
  try {
    const menu = Markup.inlineKeyboard([
      [Markup.button.callback('➕ Tambah Produk', 'ADMIN_ADD_PRODUCT')],
      [Markup.button.callback('❌ Hapus Produk', 'ADMIN_DELETE_PRODUCT')],
      [Markup.button.callback('📦 Daftar Order', 'ADMIN_LIST_ORDERS')],
      [Markup.button.callback('💳 Konfirmasi Pembayaran', 'ADMIN_CONFIRM_PAYMENT')],
      [Markup.button.callback('🚚 Input Resi', 'ADMIN_INPUT_RESI')],
      [Markup.button.callback('🔄 Ubah Status Order', 'ADMIN_UPDATE_STATUS')],
      [Markup.button.callback('💬 Ubah Greeting', 'ADMIN_EDIT_TEXTS')],
    ]);

    await ctx.reply('📊 *Admin Panel* — pilih aksi:', {
      parse_mode: 'Markdown',
      ...menu,
    });
  } catch (err) {
    console.error('❌ showAdminMenu error:', err);
    await ctx.reply('Terjadi kesalahan membuka menu admin.');
  }
}

/* ======================
   💬 Command-based Admin (tetap support)
   ====================== */
async function adminPanel(ctx) {
  const menu = `/addproduct id|name|price|stock|desc
/deleteproduct id
/listproducts
/listorders
/confirmpayment ORD-...
/setresi ORD-...|resi
/setstatus ORD-...|status
/setgreeting Your greeting here`;
  await ctx.reply('Admin panel:\n' + menu);
}

async function addProductCmd(ctx, args) {
  const payload = args.join(' ').split('|');
  if (payload.length < 3)
    return ctx.reply('Format: /addproduct id|name|price|stock|description');
  const [id, name, price, stock = '0', desc = ''] = payload;
  await productService.createProduct({
    id,
    name,
    price: Number(price),
    stock: Number(stock),
    description: desc,
  });
  await ctx.reply('✅ Produk ditambahkan');
}

async function deleteProductCmd(ctx, id) {
  await productService.deleteProduct(id);
  await ctx.reply('🗑️ Produk dihapus');
}

async function listProductsCmd(ctx) {
  const products = await productService.listProducts();
  if (!products.length) return ctx.reply('Belum ada produk');
  for (const p of products)
    await ctx.reply(`${p.id} - ${p.name} - ${p.price} - stok: ${p.stock}`);
}

async function listOrdersCmd(ctx) {
  const orders = await orderService.listOrders();
  if (!orders.length) return ctx.reply('Belum ada order');
  for (const o of orders)
    await ctx.reply(
      `${o.id} - user:${o.userId} - status:${o.status} - total:${o.total}`
    );
}

async function confirmPayment(ctx, orderId) {
  await orderService.updateOrder(orderId, { status: 'paid' });
  await ctx.reply(`💰 Order ${orderId} dikonfirmasi lunas.`);
}

async function setResi(ctx, args) {
  const payload = args.join(' ').split('|');
  if (payload.length < 2)
    return ctx.reply('Format: /setresi ORD-...|trackingNumber');
  const [orderId, resi] = payload;
  await orderService.updateOrder(orderId, {
    trackingNumber: resi,
    status: 'shipped',
  });
  await ctx.reply(`🚚 Resi ${resi} tersimpan untuk ${orderId}`);
}

async function setStatus(ctx, args) {
  const payload = args.join(' ').split('|');
  if (payload.length < 2)
    return ctx.reply('Format: /setstatus ORD-...|status');
  const [orderId, status] = payload;
  await orderService.updateOrder(orderId, { status });
  await ctx.reply(`🔄 Status ${orderId} diubah menjadi ${status}`);
}

async function setGreeting(ctx, args) {
  const text = args.join(' ');
  if (!text) return ctx.reply('Gunakan: /setgreeting <teks>');
  await settingsService.setSetting('greeting', text);
  await ctx.reply('💬 Greeting diupdate');
}

module.exports = {
  showAdminMenu,
  adminPanel,
  addProductCmd,
  deleteProductCmd,
  listProductsCmd,
  listOrdersCmd,
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
  confirmPayment,
  setResi,
  setStatus,
  setGreeting,
};
