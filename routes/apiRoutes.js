const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const apiUrl = process.env.MODE === 'PROD' ? process.env.PROD_API_URL : process.env.DEV_API_URL;

router.post('/process_message', async (req, res) => {
    const { body, from } = req.body;

    try {
        const response = await axios.post(`${apiUrl}/process_message`, {  
            body,
            from
        });

        if (response.status === 204) {
            return res.json({ reply: false, responseMessage: null });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error processing message with FastAPI:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

module.exports = router;