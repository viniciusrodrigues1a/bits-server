import Knex from 'knex';
import { IDeleteTransactionRepository } from '../../domain/repositories';

class KnexDeleteTransactionRepository implements IDeleteTransactionRepository {
  constructor(private connection: Knex) {}

  async delete(id: number) {
    await this.connection('transaction').where({ id }).del();
  }
}

export { KnexDeleteTransactionRepository };
