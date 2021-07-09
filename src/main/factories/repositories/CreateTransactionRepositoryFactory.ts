import { KnexCreateTransactionRepository } from '../../../modules/transactions/data/repositories';

const connection = require('../../../database/connection.js');

export function makeCreateTransactionRepository() {
  const repository = new KnexCreateTransactionRepository(connection);
  return repository;
}
