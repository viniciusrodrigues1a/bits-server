import { KnexFindOneTransactionRepository } from '../../../modules/transactions/data/repositories';

const connection = require('../../../database/connection.js');

export function makeFindOneTransactionRepository() {
  const repository = new KnexFindOneTransactionRepository(connection);
  return repository;
}
