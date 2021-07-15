import { AuthMiddleware } from '../../../modules/accounts/presentation/middlewares/AuthMiddleware';
import { makeValidateAuthenticationUseCase } from '../useCases';

export function makeValidateAuthenticationMiddleware() {
  const middleware = new AuthMiddleware(makeValidateAuthenticationUseCase());
  return middleware;
}
