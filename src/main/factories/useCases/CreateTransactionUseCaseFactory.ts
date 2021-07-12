import { CreateTransactionUseCase } from '../../../modules/transactions/domain/use-cases';
import {
  makeCreateTransactionRepository,
  makeFindOneCategoryRepository,
  makeFindOneWalletRepository,
} from '../repositories';

export function makeCreateTransactionUseCase() {
  const useCase = new CreateTransactionUseCase(
    makeCreateTransactionRepository(),
    makeFindOneWalletRepository(),
    makeFindOneCategoryRepository()
  );
  return useCase;
}
