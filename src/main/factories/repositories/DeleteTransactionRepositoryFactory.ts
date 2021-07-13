import { KnexDeleteTransactionRepository } from '../../../modules/transactions/data/repositories';

const connection = require('../../../database/connection.js');

export function makeDeleteTransactionRepository() {
  const repository = new KnexDeleteTransactionRepository(connection);
  return repository;
}
