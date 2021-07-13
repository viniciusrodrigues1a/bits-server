import { Router } from 'express';
import { adaptExpressRoute } from '../adapters';
import {
  makeCreateTransactionController,
  makeDeleteTransactionController,
} from '../factories/controllers';

const transactionsRoutes = Router();

transactionsRoutes.post(
  '/',
  adaptExpressRoute(makeCreateTransactionController())
);

transactionsRoutes.delete(
  '/:id',
  adaptExpressRoute(makeDeleteTransactionController())
);

export { transactionsRoutes };
