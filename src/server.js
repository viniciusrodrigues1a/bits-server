const express = require('express');
const Routes = require('./routes');
require('dotenv').config();

function App(database) {
  const server = express();

  server.use(express.json());
  server.use(Routes(database));

  return server;
}

module.exports = App;
