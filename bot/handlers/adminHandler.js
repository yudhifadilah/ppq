const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');

async function adminPanel(ctx) {
  const menu = `/addproduct id|name|price|stock|desc\n/deleteproduct id\n/listproducts\n/listorders\n/confirmpayment ORD-...\n/setresi ORD-...|resi\n/setstatus ORD-...|status\n/setgreeting Your greeting here`;
  await ctx.reply('Admin panel:\n' + menu);
}

async function addProductCmd(ctx, args) {
  const payload = args.join(' ').split('|');
  if (payload.length < 3) return ctx.reply('Format: /addproduct id|name|price|stock|description');
  const [id, name, price, stock = '0', desc = ''] = payload;
  await productService.createProduct({ id, name, price: Number(price), stock: Number(stock), description: desc });
  await ctx.reply('Produk ditambahkan');
}

async function deleteProductCmd(ctx, id) {
  await productService.deleteProduct(id);
  await ctx.reply('Produk dihapus');
}

async function listProductsCmd(ctx) {
  const products = await productService.listProducts();
  if (!products.length) return ctx.reply('Belum ada produk');
  for (const p of products) await ctx.reply(`${p.id} - ${p.name} - ${p.price} - stok: ${p.stock}`);
}

async function listOrdersCmd(ctx) {
  const orders = await orderService.listOrders();
  if (!orders.length) return ctx.reply('Belum ada order');
  for (const o of orders) await ctx.reply(`${o.id} - user:${o.userId} - status:${o.status} - total:${o.total}`);
}

async function confirmPayment(ctx, orderId) {
  await orderService.updateOrder(orderId, { status: 'paid' });
  await ctx.reply(`Order ${orderId} dikonfirmasi lunas.`);
}

async function setResi(ctx, args) {
  const payload = args.join(' ').split('|');
  if (payload.length < 2) return ctx.reply('Format: /setresi ORD-...|trackingNumber');
  const [orderId, resi] = payload;
  await orderService.updateOrder(orderId, { trackingNumber: resi, status: 'shipped' });
  await ctx.reply(`Resi ${resi} tersimpan untuk ${orderId}`);
}

async function setStatus(ctx, args) {
  const payload = args.join(' ').split('|');
  if (payload.length < 2) return ctx.reply('Format: /setstatus ORD-...|status');
  const [orderId, status] = payload;
  await orderService.updateOrder(orderId, { status });
  await ctx.reply(`Status ${orderId} diubah menjadi ${status}`);
}

async function setGreeting(ctx, args) {
  const text = args.join(' ');
  if (!text) return ctx.reply('Gunakan: /setgreeting <teks>');
  await settingsService.setSetting('greeting', text);
  await ctx.reply('Greeting diupdate');
}

module.exports = { adminPanel, addProductCmd, deleteProductCmd, listProductsCmd, listOrdersCmd, confirmPayment, setResi, setStatus, setGreeting };
