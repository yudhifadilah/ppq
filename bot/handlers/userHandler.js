// bot/handlers/userHandler.js
const settingsService = require('../../services/settingsService');
const { mainMenu } = require('../keyboards');

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
