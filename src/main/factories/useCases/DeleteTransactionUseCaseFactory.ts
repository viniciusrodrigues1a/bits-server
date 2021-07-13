import { DeleteTransactionUseCase } from '../../../modules/transactions/domain/use-cases';
import {
  makeDeleteTransactionRepository,
  makeFindOneTransactionRepository,
} from '../repositories';

export function makeDeleteTransactionUseCase() {
  const useCase = new DeleteTransactionUseCase(
    makeFindOneTransactionRepository(),
    makeDeleteTransactionRepository()
  );
  return useCase;
}
