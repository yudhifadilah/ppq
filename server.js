require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./db/database');
const bot = require('./bot');

const app = express();

// Gunakan PORT dari Leapcell environment
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // penting agar service bisa diakses dari luar

app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
  res.status(200).send('✅ Bot is running and healthy');
});

async function init() {
  try {
    // --- Koneksi ke Redis / DB ---
    await connect();
    console.log('🚀 Database connected');

    // --- Mode Webhook atau Polling ---
    if (process.env.WEBHOOK_URL) {
      const webhookPath = '/telegram/webhook';
      const webhookFull = `${process.env.WEBHOOK_URL}${webhookPath}`;

      // Hapus webhook lama biar tidak konflik
      await bot.telegram.deleteWebhook();

      // Pasang handler webhook ke Express
      app.use(bot.webhookCallback(webhookPath));

      // Daftarkan webhook baru ke Telegram
      await bot.telegram.setWebhook(webhookFull);
      console.log(`✅ Webhook registered to Telegram: ${webhookFull}`);
    } else {
      // Jika WEBHOOK_URL tidak diatur, pakai polling (mode lokal/dev)
      await bot.launch();
      console.log('🤖 Bot polling launched');
    }

    // --- Jalankan server ---
    app.listen(PORT, HOST, () => {
      console.log(`🌐 Server listening on http://${HOST}:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Initialization failed:', err);
    process.exit(1);
  }
}

// Jalankan inisialisasi
init();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
