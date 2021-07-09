import { Router } from 'express';
import { adaptExpressRoute } from '../adapters';
import { makeCreateTransactionController } from '../factories/controllers';

const transactionsRoutes = Router();

transactionsRoutes.post(
  '/',
  adaptExpressRoute(makeCreateTransactionController())
);

export { transactionsRoutes };
