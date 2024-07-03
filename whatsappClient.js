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
    const chat = await msg.getChat();

    try {
        const response = await axios.post(`${apiUrl}/process_message`, { 
            body: msg.body,
            from: msg.from,
            to : msg.to
        });

        const { reply, responseMessage } = response.data;

        if (responseMessage) {
            if (reply) {
                chat.sendSeen();
                chat.sendStateTyping();
                setTimeout(() => {
                    msg.reply(responseMessage);
                }, Math.random() * 1000 + 1000);
            } else {
                chat.sendSeen();
                chat.sendStateTyping();
                const delay = Math.random() * 1000 + 1000;
                setTimeout(() => {
                    if (client && client.sendMessage) {
                        client.sendMessage(msg.from, responseMessage);
                    } else {
                        console.error(
                            'Client is not initialized or sendMessage is not a function'
                        );
                    }
                }, delay);
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