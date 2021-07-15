import { Transaction } from '../models/Transaction';
import { IFindOneTransactionRepository } from '../repositories';
import { TransactionNotFoundError } from './errors';
import { IListTransactionUseCase } from './IListTransactionUseCase';

class ListTransactionUseCase implements IListTransactionUseCase {
  constructor(
    private findOneTransactionRepository: IFindOneTransactionRepository
  ) {}

  async list(id: number): Promise<Transaction> {
    const transaction = await this.findOneTransactionRepository.findOne(id);

    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    return transaction;
  }
}

export { ListTransactionUseCase };
