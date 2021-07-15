import { KnexFindOneAccountRepository } from '../../../modules/accounts/data/repositories';

const connection = require('../../../database/connection.js');

export function makeFindOneAccountRepository() {
  const repository = new KnexFindOneAccountRepository(connection);
  return repository;
}
