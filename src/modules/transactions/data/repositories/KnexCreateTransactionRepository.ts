import { CreateTransactionDTO } from '../../domain/dtos';
import { Transaction } from '../../domain/models/Transaction';
import { ICreateTransactionRepository } from '../../domain/repositories';
import Knex from 'knex';

class KnexCreateTransactionRepository implements ICreateTransactionRepository {
  constructor(private connection: Knex) {}

  async create({
    categoryId,
    walletId,
    amount,
    description,
  }: CreateTransactionDTO): Promise<Transaction> {
    const [transaction] = await this.connection('transaction')
      .insert({
        category_id: categoryId,
        wallet_id: walletId,
        amount,
        description,
      })
      .returning('*');

    return transaction;
  }
}

export { KnexCreateTransactionRepository };
