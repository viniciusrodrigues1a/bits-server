import { Transaction } from '../models/Transaction';
import { WalletNotFoundError, CategoryNotFoundError } from './errors';
import { CreateTransactionDTO } from '../dtos';
import {
  ICreateTransactionRepository,
  IFindOneWalletRepository,
  IFindOneCategoryRepository,
} from '../repositories';
import { ICreateTransactionUseCase } from './ICreateTransactionUseCase';

class CreateTransactionUseCase implements ICreateTransactionUseCase {
  constructor(
    private createTransactionRepository: ICreateTransactionRepository,
    private findOneWalletRepository: IFindOneWalletRepository,
    private findOneCategoryRepository: IFindOneCategoryRepository
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

    const category = await this.findOneCategoryRepository.findOne(categoryId);
    if (!category) {
      throw new CategoryNotFoundError();
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
