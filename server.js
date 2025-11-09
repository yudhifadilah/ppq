require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./db/database');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // penting untuk Leapcell agar bisa diakses dari luar

app.use(bodyParser.json());

// health check
app.get('/', (req, res) => res.status(200).send('Bot is running ✅'));

async function init() {
  await connect();
  console.log('Database connected');

  if (process.env.WEBHOOK_URL) {
    const webhookPath = '/telegram/webhook';
    const webhookFull = `${process.env.WEBHOOK_URL}${webhookPath}`;

    // pastikan webhookCallback dipasang sebelum setWebhook
    app.use(bot.webhookCallback(webhookPath));

    // pastikan Telegram dapat respon cepat (200)
    app.post(webhookPath, (req, res) => {
      res.status(200).send('OK');
    });

    await bot.telegram.setWebhook(webhookFull);
    console.log('Webhook registered to Telegram');
  } else {
    await bot.launch();
    console.log('Bot polling launched');
  }

  // listen host:0.0.0.0 supaya Leapcell bisa akses
  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

init().catch((err) => {
  console.error('Initialization failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
