const orderService = require('../../services/orderService');

async function handleUpload(ctx) {
  const caption = ctx.message.caption || '';
  const found = caption.match(/(ORD-\d+)/);
  if (!found) return ctx.reply('Mohon sertakan ID order di caption, contoh: ORD-123456');
  const orderId = found[1];
  const fileId = ctx.message.photo ? ctx.message.photo.slice(-1)[0].file_id : (ctx.message.document && ctx.message.document.file_id);
  if (!fileId) return ctx.reply('File tidak ditemukan.');
  await orderService.updateOrder(orderId, { paymentProofFileId: fileId, status: 'waiting_confirmation' });
  await ctx.reply(`Bukti pembayaran diterima untuk order ${orderId}. Admin akan memverifikasi.`);
}

module.exports = { handleUpload };
