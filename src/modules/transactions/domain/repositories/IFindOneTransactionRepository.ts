import { Transaction } from '../models/Transaction';

interface IFindOneTransactionRepository {
  findOne(id: number): Promise<Transaction | undefined>;
}

export { IFindOneTransactionRepository };
