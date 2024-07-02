const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [/* your args here */]
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
        // Send a new message as a reply to the current one
        msg.reply('pong');

    } else if (msg.body === '!ping') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'pong');

    } 
    
});



// Closing correctly using CTRL+C
process.on('SIGINT', async () => {
    console.log('(SIGINT) Shutting down chat gracefully... 💝');
    await client.destroy();
    console.log('client destroyed');
    process.exit(0);
});
