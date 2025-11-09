require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./db/database');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

async function init() {
  await connect();
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (!WEBHOOK_URL) throw new Error('WEBHOOK_URL is required for webhook mode');
  const webhookPath = '/telegram/webhook';
  const webhookUrl = WEBHOOK_URL.replace(/\/$/, '') + webhookPath;
  await bot.telegram.setWebhook(webhookUrl);
  app.use(bot.webhookCallback(webhookPath));
  console.log('Webhook registered:', webhookUrl);

  app.get('/', (req, res) => res.send('Bot is running ✅'));

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

init().catch((err) => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
