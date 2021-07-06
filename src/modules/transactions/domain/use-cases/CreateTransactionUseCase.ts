import { Transaction } from '../models/Transaction';
import { WalletNotFoundError } from './errors';
import { CreateTransactionDTO } from '../dtos';
import {
  ICreateTransactionRepository,
  IFindOneWalletRepository,
} from '../repositories';

class CreateTransactionUseCase {
  constructor(
    private createTransactionRepository: ICreateTransactionRepository,
    private findOneWalletRepository: IFindOneWalletRepository
  ) {}

  async create({
    categoryId,
    walletId,
    amount,
    description,
  }: CreateTransactionDTO): Promise<Transaction> {
    const wallet = await this.findOneWalletRepository.findOne(walletId);

    if (!wallet) {
      throw new WalletNotFoundError();
    }

    const transaction = await this.createTransactionRepository.create({
      categoryId,
      walletId,
      amount,
      description,
    });

    return transaction;
  }
}

export { CreateTransactionUseCase };
