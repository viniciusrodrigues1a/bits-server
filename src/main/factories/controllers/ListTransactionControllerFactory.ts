import { ListTransactionController } from '../../../modules/transactions/presentation/controllers';
import { makeListTransactionUseCase } from '../useCases';

export function makeListTransactionController() {
  const controller = new ListTransactionController(
    makeListTransactionUseCase()
  );
  return controller;
}
