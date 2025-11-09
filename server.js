require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./db/database');
const bot = require('./bot');

const app = express();

app.use(bodyParser.json());

// Endpoint untuk webhook Telegram
app.post('/telegram/webhook', bot.webhookCallback('/telegram/webhook'));

// Health check (untuk tes)
app.get('/', (req, res) => {
  res.send('✅ Telegram bot (serverless mode) aktif');
});

async function init() {
  await connect();
  console.log('Database connected');

  // Set webhook ke Telegram (sekali saat deploy)
  if (process.env.WEBHOOK_URL) {
    await bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/telegram/webhook`);
    console.log('Webhook registered to Telegram');
  }
}

init().catch(console.error);

module.exports = app;
