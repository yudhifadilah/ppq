// bot/handlers/adminHandler.js
const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');
const { Markup } = require('telegraf');

/* ===========================
   🧭 Panel Admin Utama
=========================== */
async function showAdminMenu(ctx) {
  try {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('➕ Tambah Produk', 'ADMIN_ADD_PRODUCT')],
      [Markup.button.callback('❌ Hapus Produk', 'ADMIN_DELETE_PRODUCT')],
      [Markup.button.callback('📦 Daftar Order', 'ADMIN_LIST_ORDERS')],
      [Markup.button.callback('💳 Konfirmasi Pembayaran', 'ADMIN_CONFIRM_PAYMENT')],
      [Markup.button.callback('🚚 Input Resi', 'ADMIN_SET_RESI')],
      [Markup.button.callback('🔄 Ubah Status Order', 'ADMIN_SET_STATUS')],
      [Markup.button.callback('💬 Ubah Greeting', 'ADMIN_SET_GREETING')],
    ]);

    await ctx.reply('📋 *Panel Admin* — pilih aksi:', {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  } catch (err) {
    console.error('❌ showAdminMenu error:', err);
    await ctx.reply('Terjadi kesalahan membuka panel admin.');
  }
}

/* ===========================
   ➕ Tambah & Hapus Produk
=========================== */
async function addProduct(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingAddProduct = true;
  await ctx.reply('🧾 Kirim data produk dalam format:\n\n`id|nama|harga|stok|deskripsi`', {
    parse_mode: 'Markdown',
  });
}

async function deleteProduct(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingDeleteProduct = true;
  await ctx.reply('🗑 Kirim *ID produk* yang ingin dihapus:', { parse_mode: 'Markdown' });
}

/* ===========================
   📦 Daftar & Kelola Order
=========================== */
async function listOrders(ctx) {
  try {
    const orders = await orderService.listOrders();
    if (!orders.length) return ctx.reply('📭 Belum ada order.');

    for (const o of orders) {
      await ctx.replyWithMarkdown(
        `📦 *${o.id}*\n👤 User: ${o.userId}\n💰 Total: ${o.total}\n📍 Status: ${o.status}`
      );
    }
  } catch (err) {
    console.error('❌ listOrders error:', err);
    await ctx.reply('Gagal memuat daftar order.');
  }
}

async function confirmPayment(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingConfirmOrder = true;
  await ctx.reply('💳 Kirim ID order untuk dikonfirmasi pembayarannya (contoh: ORD-1234)');
}

async function setResi(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSetResi = true;
  await ctx.reply('🚚 Kirim data dalam format:\n\n`ORD-...|nomor_resi`', {
    parse_mode: 'Markdown',
  });
}

async function setStatus(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSetStatus = true;
  await ctx.reply('🔄 Kirim data dalam format:\n\n`ORD-...|status`', {
    parse_mode: 'Markdown',
  });
}

/* ===========================
   💬 Greeting
=========================== */
async function setGreeting(ctx) {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSetGreeting = true;
  await ctx.reply('💬 Kirim teks greeting baru:');
}

/* ===========================
   🧩 Ekspor Semua Fungsi
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
