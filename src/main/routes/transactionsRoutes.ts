import { Router } from 'express';
import { adaptExpressMiddleware, adaptExpressRoute } from '../adapters';
import {
  makeCreateTransactionController,
  makeDeleteTransactionController,
  makeListTransactionController,
} from '../factories/controllers';
import { makeValidateAuthenticationMiddleware } from '../factories/middlewares';

const transactionsRoutes = Router();

transactionsRoutes.post(
  '/',
  adaptExpressMiddleware(makeValidateAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateTransactionController())
);

transactionsRoutes.delete(
  '/:id',
  adaptExpressMiddleware(makeValidateAuthenticationMiddleware()),
  adaptExpressRoute(makeDeleteTransactionController())
);

transactionsRoutes.get(
  '/:id',
  adaptExpressMiddleware(makeValidateAuthenticationMiddleware()),
  adaptExpressRoute(makeListTransactionController())
);

export { transactionsRoutes };
