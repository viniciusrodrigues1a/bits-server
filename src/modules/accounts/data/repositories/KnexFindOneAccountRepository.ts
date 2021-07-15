import Knex from 'knex';
import { Account } from 'modules/accounts/domain/models/Account';
import { IFindOneAccountRepository } from '../../domain/repositories';

class KnexFindOneAccountRepository implements IFindOneAccountRepository {
  constructor(private connection: Knex) {}

  async findOne(accountId: number): Promise<Account | undefined> {
    const account = await this.connection('user')
      .where({ id: accountId })
      .select('*')
      .first();

    return account;
  }
}

export { KnexFindOneAccountRepository };
