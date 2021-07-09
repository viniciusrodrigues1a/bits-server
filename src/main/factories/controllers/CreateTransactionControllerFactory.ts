import { CreateTransactionController } from '../../../modules/transactions/presentation/controllers';
import { makeCreateTransactionUseCase } from '../useCases';

export function makeCreateTransactionController() {
  const controller = new CreateTransactionController(
    makeCreateTransactionUseCase()
  );
  return controller;
}
