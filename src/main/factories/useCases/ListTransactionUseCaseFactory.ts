import { ListTransactionUseCase } from '../../../modules/transactions/domain/use-cases';
import { makeFindOneTransactionRepository } from '../repositories';

export function makeListTransactionUseCase() {
  const useCase = new ListTransactionUseCase(
    makeFindOneTransactionRepository()
  );
  return useCase;
}
