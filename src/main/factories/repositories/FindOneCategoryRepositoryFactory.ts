import { KnexFindOneCategoryRepository } from '../../../modules/transactions/data/repositories';

const connection = require('../../../database/connection.js');

export function makeFindOneCategoryRepository() {
  const repository = new KnexFindOneCategoryRepository(connection);
  return repository;
}
