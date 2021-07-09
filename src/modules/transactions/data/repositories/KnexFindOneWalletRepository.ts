import { IFindOneWalletRepository } from '../../domain/repositories';
import Knex from 'knex';

class KnexFindOneWalletRepository implements IFindOneWalletRepository {
  constructor(private connection: Knex) {}

  async findOne(id: number): Promise<any> {
    const wallet = await this.connection('wallet')
      .where({ id })
      .select('*')
      .first();

    return wallet;
  }
}

export { KnexFindOneWalletRepository };
