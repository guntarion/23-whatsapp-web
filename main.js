require('dotenv').config();

const express = require('express');
const appRoutes = require('./routes/appRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const port = 3010;

// Middleware to parse JSON
app.use(express.json());

// Use the routes
app.use('/api', apiRoutes);
app.use('/app', appRoutes);

app.listen(port, () => {
    console.log(`Express server is running on http://localhost:${port}`);
});