import { CreateTransactionDTO } from '../dtos';
import { Transaction } from '../models/Transaction';

interface ICreateTransactionUseCase {
  create(data: CreateTransactionDTO): Promise<Transaction>;
}

export { ICreateTransactionUseCase };
