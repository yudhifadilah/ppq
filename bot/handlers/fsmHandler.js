// bot/handlers/fsmHandler.js
const productService = require('../../services/productService');
const orderService = require('../../services/orderService');
const settingsService = require('../../services/settingsService');

/**
 * 🎯 Handler utama untuk state-based input (FSM)
 */
async function handleState(ctx) {
  ctx.session = ctx.session || {};
  const text = ctx.message.text.trim();

  /* ===================================
     🧾 TAMBAH PRODUK (ADMIN)
  =================================== */
  if (ctx.session.awaitingAddProduct) {
    try {
      // Format: id|nama|harga|stok|deskripsi|link1,link2,...
      const parts = text.split('|');
      if (parts.length < 5)
        return ctx.reply('❌ Format salah!\nGunakan:\n`id|nama|harga|stok|deskripsi|link1,link2,...`', {
          parse_mode: 'Markdown',
        });

      const [id, name, price, stock, description, linksRaw] = parts;

      // Parsing link opsional
      let links = [];
      if (linksRaw && linksRaw.trim() !== '') {
        links = linksRaw.split(',').map((l) => l.trim()).filter((l) => l.startsWith('http'));
      }

      await productService.createProduct({
        id: id.trim(),
        name: name.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
        description: description.trim(),
        links,
      });

      ctx.session.awaitingAddProduct = false;

      await ctx.reply(
        `✅ Produk *${name.trim()}* berhasil disimpan!\n💰 Harga: Rp${price}\n📦 Stok: ${stock}\n📝 ${description}\n🔗 Link: ${links.length ? links.join(', ') : '(tidak ada)'}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('❌ Error tambah produk:', err);
      await ctx.reply('⚠️ Gagal menambah produk. Cek format dan coba lagi.');
    }
    return;
  }

  /* ===================================
     🗑 HAPUS PRODUK
  =================================== */
  if (ctx.session.awaitingDeleteProduct) {
    try {
      await productService.deleteProduct(text);
      await ctx.reply(`🗑 Produk *${text}* berhasil dihapus.`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('❌ Error hapus produk:', err);
      await ctx.reply('⚠️ Gagal menghapus produk.');
    }
    ctx.session.awaitingDeleteProduct = false;
    return;
  }

  /* ===================================
     💳 KONFIRMASI PEMBAYARAN
  =================================== */
  if (ctx.session.awaitingConfirmOrder) {
    try {
      await orderService.updateOrder(text, { status: 'paid' });
      await ctx.reply(`✅ Order ${text} dikonfirmasi lunas.`);
    } catch (err) {
      console.error('❌ Error konfirmasi pembayaran:', err);
      await ctx.reply('⚠️ Gagal konfirmasi pembayaran.');
    }
    ctx.session.awaitingConfirmOrder = false;
    return;
  }

  /* ===================================
     🚚 INPUT RESI
  =================================== */
  if (ctx.session.awaitingSetResi) {
    try {
      const [orderId, resi] = text.split('|');
      if (!orderId || !resi) return ctx.reply('❌ Format salah!\nGunakan: `ORD-123|JNT123456`', { parse_mode: 'Markdown' });

      await orderService.updateOrder(orderId.trim(), {
        trackingNumber: resi.trim(),
        status: 'shipped',
      });

      await ctx.reply(`✅ Resi *${resi.trim()}* disimpan untuk *${orderId.trim()}*`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('❌ Error set resi:', err);
      await ctx.reply('⚠️ Gagal menyimpan nomor resi.');
    }
    ctx.session.awaitingSetResi = false;
    return;
  }

  /* ===================================
     🔄 UBAH STATUS ORDER
  =================================== */
  if (ctx.session.awaitingSetStatus) {
    try {
      const [orderId, status] = text.split('|');
      if (!orderId || !status) return ctx.reply('❌ Format salah!\nGunakan: `ORD-123|status_baru`', { parse_mode: 'Markdown' });

      await orderService.updateOrder(orderId.trim(), { status: status.trim() });
      await ctx.reply(`✅ Status *${orderId.trim()}* diubah menjadi *${status.trim()}*`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('❌ Error ubah status:', err);
      await ctx.reply('⚠️ Gagal mengubah status order.');
    }
    ctx.session.awaitingSetStatus = false;
    return;
  }

  /* ===================================
     💬 UBAH GREETING
  =================================== */
  if (ctx.session.awaitingSetGreeting) {
    try {
      await settingsService.setSetting('greeting', text);
      await ctx.reply('✅ Greeting berhasil diubah.');
    } catch (err) {
      console.error('❌ Error ubah greeting:', err);
      await ctx.reply('⚠️ Gagal menyimpan greeting.');
    }
    ctx.session.awaitingSetGreeting = false;
    return;
  }
}

module.exports = { handleState };
=======
const { getClient } = require('../../db/database');

module.exports = {
  async handleState(ctx) {
    const client = getClient();
    if (!client) return ctx.reply('⚠️ Database belum siap, coba lagi.');
    // lanjutkan FSM seperti biasa
  },
};
>>>>>>> 26ad41e6d8332003f58e3e5666a639aa91fd4b08
