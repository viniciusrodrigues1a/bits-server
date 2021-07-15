import { IValidateAuthenticationUseCase } from '../../domain/use-cases/IValidateAuthenticationUseCase';
import {
  HttpRequest,
  HttpResponse,
} from 'modules/transactions/presentation/protocols';
import {
  notFoundResponse,
  okResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from '../../../shared/presentation/helpers';
import {
  AccountNotFoundError,
  InvalidTokenError,
} from '../../domain/use-cases/errors';

class AuthMiddleware {
  constructor(
    private validateAuthenticationUseCase: IValidateAuthenticationUseCase
  ) {}

  async handleRequest(request: HttpRequest): Promise<HttpResponse> {
    try {
      const account = await this.validateAuthenticationUseCase.validate(
        request.headers.authorization
      );

      return okResponse(account);
    } catch (err) {
      if (err.message === new AccountNotFoundError().message) {
        return notFoundResponse(err.message);
      }

      if (err.message === new InvalidTokenError().message) {
        return unauthorizedResponse(err.message);
      }

      return serverErrorResponse();
    }
  }
}

export { AuthMiddleware };
