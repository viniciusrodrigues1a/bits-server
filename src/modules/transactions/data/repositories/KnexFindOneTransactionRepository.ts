import Knex from 'knex';
import { IFindOneTransactionRepository } from '../../domain/repositories';

class KnexFindOneTransactionRepository
  implements IFindOneTransactionRepository {
  constructor(private connection: Knex) {}

  async findOne(id: number) {
    const transaction = await this.connection('transaction')
      .where({ id })
      .select('*')
      .first();

    return transaction;
  }
}

export { KnexFindOneTransactionRepository };
