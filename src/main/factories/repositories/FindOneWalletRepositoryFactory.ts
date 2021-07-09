import { KnexFindOneWalletRepository } from '../../../modules/transactions/data/repositories';

const connection = require('../../../database/connection.js');

export function makeFindOneWalletRepository() {
  const repository = new KnexFindOneWalletRepository(connection);
  return repository;
}
