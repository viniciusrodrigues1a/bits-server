const express = require('express');
const Routes = require('./routes');
require('dotenv').config();

const { transactionsRoutes } = require('./main/routes');

function App(database) {
  const server = express();

  server.use(express.json());
  server.use(Routes(database));
  server.use('/transactions', transactionsRoutes);

  return server;
}

module.exports = App;
