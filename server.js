require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./db/database');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(bodyParser.json());
app.get('/', (req, res) => res.status(200).send('✅ Bot is running and healthy'));

async function init() {
  await connect();
  console.log('🚀 Database connected');

  if (process.env.WEBHOOK_URL) {
    const webhookPath = '/telegram/webhook';
    const webhookFull = `${process.env.WEBHOOK_URL}${webhookPath}`;

    app.use(bot.webhookCallback(webhookPath));
    await bot.telegram.setWebhook(webhookFull);

    console.log('✅ Webhook registered to Telegram:', webhookFull);
  } else {
    await bot.launch();
    console.log('🤖 Bot polling launched');
  }

  app.listen(PORT, HOST, () => {
    console.log(`🌐 Server listening on http://${HOST}:${PORT}`);
  });
}

init().catch((err) => {
  console.error('❌ Initialization failed:', err);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
