import {
  CategoryNotFoundError,
  WalletNotFoundError,
} from '../../domain/use-cases/errors';
import { ICreateTransactionUseCase } from '../../domain/use-cases/ICreateTransactionUseCase';
import { okResponse, notFoundResponse, serverErrorResponse } from '../helpers';
import { HttpRequest, HttpResponse } from '../protocols';

class CreateTransactionController {
  constructor(private createTransactionUseCase: ICreateTransactionUseCase) {}

  async handleRequest(request: HttpRequest): Promise<HttpResponse> {
    try {
      const transaction = await this.createTransactionUseCase.create(
        request.body
      );

      return okResponse(transaction);
    } catch (err) {
      if (
        err.message === new WalletNotFoundError().message ||
        err.message === new CategoryNotFoundError().message
      ) {
        return notFoundResponse(err.message);
      }
    }

    return serverErrorResponse();
  }
}

export { CreateTransactionController };
