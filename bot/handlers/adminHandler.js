const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');

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
  confirmPayment,
  setResi,
  setStatus,
  setGreeting,
};
