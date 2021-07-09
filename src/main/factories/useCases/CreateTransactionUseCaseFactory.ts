import { CreateTransactionUseCase } from '../../../modules/transactions/domain/use-cases';
import {
  makeCreateTransactionRepository,
  makeFindOneWalletRepository,
} from '../repositories';

export function makeCreateTransactionUseCase() {
  const useCase = new CreateTransactionUseCase(
    makeCreateTransactionRepository(),
    makeFindOneWalletRepository()
  );
  return useCase;
}
