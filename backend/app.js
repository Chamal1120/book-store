const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Import the routes​

// Begin Application config​
const app = express();
app.use(bodyParser.json());

// Mount routes under /api/v1/​
app.use('/api/v1/', routes);

module.exports = app
