// bot/handlers/adminHandler.js
const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');
const { Markup } = require('telegraf');

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
  confirmPayment,
  setResi,
  setStatus,
  setGreeting,
};
