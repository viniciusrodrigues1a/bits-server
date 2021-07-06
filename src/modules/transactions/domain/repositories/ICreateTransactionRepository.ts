import { Transaction } from '../models/Transaction';
import { CreateTransactionDTO } from '../dtos';

interface ICreateTransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>;
}

export { ICreateTransactionRepository };
