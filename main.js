const express = require('express');
const appRoutes = require('./routes/appRoutes');

const app = express();
const port = 3010;

// Middleware to parse JSON
app.use(express.json());

// Use the routes defined in appRoutes.js
app.use('/api', appRoutes);

app.listen(port, () => {
    console.log(`Express server is running on http://localhost:${port}`);
});