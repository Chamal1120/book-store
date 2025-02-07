const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes'); // Import the routes​

// Begin Application config​
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Specify the exact origin
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions)); // Use the CORS options

app.use(bodyParser.json());

// Mount routes under /api/v1/​
app.use('/api/v1/', routes);

module.exports = app
