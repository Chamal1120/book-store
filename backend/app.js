const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes'); // Import the routes​

// Begin Application config​
const app = express();

const allowedOrigins = [
  'http://book-store-skyops-terraform-front.s3-website-us-east-1.amazonaws.com',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use the CORS options

app.use(bodyParser.json());

// Mount routes under /api/v1/​
app.use('/api', routes);

module.exports = app
