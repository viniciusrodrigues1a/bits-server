import { Account } from '../models/Account';

interface IFindOneAccountRepository {
  findOne(accountId: number): Promise<Account | undefined>;
}

export { IFindOneAccountRepository };
