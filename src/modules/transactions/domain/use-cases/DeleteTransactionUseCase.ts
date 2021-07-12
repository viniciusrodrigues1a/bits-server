import {
  IDeleteTransactionRepository,
  IFindOneTransactionRepository,
} from '../repositories';
import { TransactionNotFoundError } from './errors';
import { IDeleteTransactionUseCase } from './IDeleteTransactionUseCase';

class DeleteTransactionUseCase implements IDeleteTransactionUseCase {
  constructor(
    private findOneTransactionRepository: IFindOneTransactionRepository,
    private deleteTransactionRepository: IDeleteTransactionRepository
  ) {}

  async delete(id: number): Promise<boolean> {
    const transaction = await this.findOneTransactionRepository.findOne(id);
    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    await this.deleteTransactionRepository.delete(id);

    return true;
  }
}

export { DeleteTransactionUseCase };
