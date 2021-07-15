import { Transaction } from '../models/Transaction';

interface IListTransactionUseCase {
  list(id: number): Promise<Transaction>;
}

export { IListTransactionUseCase };
