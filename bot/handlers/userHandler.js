const settingsService = require('../../services/settingsService');
const { mainMenu } = require('../keyboards');
const { getClient } = require('../../db/database');

module.exports = {
  async start(ctx, isAdmin = false) {
    const greeting =
      (await settingsService.getSetting('greeting')) ||
      '👋 Selamat datang di toko kami!';
    const help =
      (await settingsService.getSetting('help')) ||
      'Gunakan menu di bawah untuk melihat produk, membeli, atau melacak pesanan.';

    await ctx.reply(`${greeting}\n\n${help}`, mainMenu(isAdmin));
  },

  // 📦 Daftar produk
  async viewProducts(ctx) {
    const client = getClient();
    const ids = await client.sMembers('products');
    if (!ids || ids.length === 0)
      return ctx.reply('📭 Belum ada produk tersedia.');

    const buttons = [];
    for (const id of ids) {
      const data = await client.hGetAll(`product:${id}`);
      if (!data || !data.name) continue;
      buttons.push([{ text: `🛍️ ${data.name}`, callback_data: `VIEW_DETAIL_${id}` }]);
    }

    await ctx.reply('🛒 Pilih produk untuk melihat detail:', {
      reply_markup: { inline_keyboard: buttons },
    });
  },

  // 📖 Detail produk
  async viewProductDetail(ctx) {
    const client = getClient();
    const id = ctx.callbackQuery.data.replace('VIEW_DETAIL_', '');
    const data = await client.hGetAll(`product:${id}`);

    if (!data || !data.id)
      return ctx.editMessageText('❌ Produk tidak ditemukan.');

    const randomLink = await client.sRandMember(`product_links:${id}`);

    const message = `🛍️ *${data.name}*\n💰 Harga: Rp${Number(
      data.price || 0
    ).toLocaleString('id-ID')}\n📦 Stok: ${
      data.stock
    }\n📝 ${data.description || '-'}`;

    const buttons = [
      [
        {
          text: '🌐 Buka Link Acak',
          callback_data: `OPEN_LINK_${id}`,
        },
      ],
      [{ text: '⬅️ Kembali', callback_data: 'VIEW_PRODUCTS' }],
    ];

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons },
    });

    // Simpan link awal ke session (agar tahu yang terakhir dipakai)
    ctx.session = ctx.session || {};
    ctx.session.lastProductLink = randomLink || null;
  },

  // 🎲 Klik tombol "Buka Link Acak" → langsung ganti link acak baru
  async openRandomLink(ctx) {
    const client = getClient();
    const id = ctx.callbackQuery.data.replace('OPEN_LINK_', '');
    const randomLink = await client.sRandMember(`product_links:${id}`);

    if (!randomLink) {
      return ctx.answerCbQuery('❌ Tidak ada link untuk produk ini.');
    }

    // Ambil ulang data produk
    const data = await client.hGetAll(`product:${id}`);
    const message = `🛍️ *${data.name}*\n💰 Harga: Rp${Number(
      data.price || 0
    ).toLocaleString('id-ID')}\n📦 Stok: ${
      data.stock
    }\n📝 ${data.description || '-'}`;

    // ⬇️ Tombol tetap sama, tapi link berubah setiap klik
    const buttons = [
      [{ text: '🌐 Buka Link Acak', url: randomLink, callback_data: `OPEN_LINK_${id}` }],
      [{ text: '⬅️ Kembali', callback_data: 'VIEW_PRODUCTS' }],
    ];

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons },
    });

    ctx.answerCbQuery('🎲 Link diacak ulang!');
  async viewProducts(ctx) {
    // ambil list produk dari Redis
    const client = require('../../db/database').getClient();
    const products = await client.hGetAll('products');
    if (!products || Object.keys(products).length === 0)
      return ctx.reply('Belum ada produk.');

    for (const [id, raw] of Object.entries(products)) {
      let product;
      try {
        product = JSON.parse(raw);
      } catch {
        product = { name: id, price: '-', desc: '-' };
      }

      await ctx.reply(
        `🛍️ *${product.name || 'Produk'}*\n💰 Harga: ${product.price || '-'}\n📦 ${product.desc || '-'}`,
        { parse_mode: 'Markdown' }
      );
    }
  },
};
