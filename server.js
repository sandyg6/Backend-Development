const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const productRoutes = require('./routes/productAnalytics');
const stockRoutes = require('./routes/stockAvailability');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api', productRoutes);
app.use('/api', stockRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
