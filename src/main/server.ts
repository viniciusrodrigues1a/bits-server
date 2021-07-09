import express from 'express';
import { transactionsRoutes } from './routes';

const connection = require('../database/connection');
const Routes = require('../routes');

require('dotenv').config();

function App() {
  const server = express();

  server.use(express.json());
  server.use(Routes(connection));
  server.use('/transactions', transactionsRoutes);

  return server;
}

export { App };
