const express = require('express');
const router = express.Router();
const client = require('../whatsappClient'); // Import the client directly

router.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).send({ error: 'Number and message are required' });
    }

    try {
        const chatId = `${number}@c.us`; // Format the number as WhatsApp expects
        await client.sendMessage(chatId, message);
        res.send({ status: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ error: 'Failed to send message' });
    }
});

router.get('/status', (req, res) => {
    res.send({ status: client.info ? 'connected' : 'disconnected' });
});

module.exports = router;