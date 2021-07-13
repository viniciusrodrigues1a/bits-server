import { DeleteTransactionController } from '../../../modules/transactions/presentation/controllers';
import { makeDeleteTransactionUseCase } from '../useCases/DeleteTransactionUseCaseFactory';

export function makeDeleteTransactionController() {
  const controller = new DeleteTransactionController(
    makeDeleteTransactionUseCase()
  );
  return controller;
}
