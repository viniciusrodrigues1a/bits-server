import { Router } from 'express';
import { adaptExpressMiddleware, adaptExpressRoute } from '../adapters';
import {
  makeCreateTransactionController,
  makeDeleteTransactionController,
  makeListTransactionController,
} from '../factories/controllers';
import { makeValidateAuthenticationMiddleware } from '../factories/middlewares';

const transactionsRoutes = Router();

const authMiddleware = adaptExpressMiddleware(
  makeValidateAuthenticationMiddleware()
);

transactionsRoutes.post(
  '/',
  authMiddleware,
  adaptExpressRoute(makeCreateTransactionController())
);

transactionsRoutes.delete(
  '/:id',
  authMiddleware,
  adaptExpressRoute(makeDeleteTransactionController())
);

transactionsRoutes.get(
  '/:id',
  authMiddleware,
  adaptExpressRoute(makeListTransactionController())
);

export { transactionsRoutes };
