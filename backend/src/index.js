const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const { notFound, errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

app.use('*', notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log('Backend running on http://localhost:' + port));
}

module.exports = app;
