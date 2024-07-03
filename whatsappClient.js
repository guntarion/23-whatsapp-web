const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const apiUrl = process.env.MODE === 'PROD' ? process.env.PROD_API_URL : process.env.DEV_API_URL;

const client = new Client({
    authStrategy: new LocalAuth(),
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't work in Windows
            '--disable-gpu',
        ]
    }
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('ready', async () => {
    const version = await client.getWWebVersion();
    console.log(`WWeb v${version}`);
    console.log('🧤 WhatsApp Client is ready!');
});

client.initialize();

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    try {
        const response = await axios.post(`${apiUrl}/api/process_message`, {  // Corrected the endpoint path
            body: msg.body,
            from: msg.from
        });

        const { reply, responseMessage } = response.data;

        if (responseMessage) {
            if (reply) {
                msg.reply(responseMessage);
            } else {
                client.sendMessage(msg.from, responseMessage);
            }
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

process.on('SIGINT', async () => {
    console.log('(SIGINT) Shutting down chat gracefully... 💝');
    await client.destroy();
    console.log('client destroyed');
    process.exit(0);
});

module.exports = client;