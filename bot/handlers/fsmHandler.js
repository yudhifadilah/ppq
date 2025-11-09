const { client } = require('../../db/database');
const orderService = require('../../services/orderService');

async function handleTextState(ctx, text) {
  const uid = ctx.from.id;
  const state = await client.hGet(`user:${uid}`, 'state');
  if (state === 'AWAITING_TRACK_ID') {
    const order = await orderService.getOrder(text.trim());
    if (!order) return ctx.reply('Order tidak ditemukan');
    await ctx.reply(`Status order ${order.id}: ${order.status}\nResi: ${order.trackingNumber || 'belum ada'}`);
    await client.hDel(`user:${uid}`, 'state');
    return true;
  }
  return false;
}

module.exports = { handleTextState };
