const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [
            /* your args here */
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
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

    if (msg.body === '!ping reply') {
        msg.reply('pong');
    } else if (msg.body === '!ping') {
        client.sendMessage(msg.from, 'pong');
    }
});

process.on('SIGINT', async () => {
    console.log('(SIGINT) Shutting down chat gracefully... 💝');
    await client.destroy();
    console.log('client destroyed');
    process.exit(0);
});

module.exports = client;