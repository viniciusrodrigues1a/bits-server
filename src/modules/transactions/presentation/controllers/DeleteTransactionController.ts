import { TransactionNotFoundError } from '../../domain/use-cases/errors';
import { IDeleteTransactionUseCase } from '../../domain/use-cases/IDeleteTransactionUseCase';
import {
  noContentResponse,
  notFoundResponse,
  serverErrorResponse,
} from '../../../shared/presentation/helpers';
import { HttpRequest, HttpResponse } from '../protocols';

class DeleteTransactionController {
  constructor(private deleteTransactionUseCase: IDeleteTransactionUseCase) {}

  async handleRequest(request: HttpRequest): Promise<HttpResponse> {
    try {
      await this.deleteTransactionUseCase.delete(request.params.id);

      return noContentResponse();
    } catch (err) {
      if (err.message === new TransactionNotFoundError().message) {
        return notFoundResponse(err.message);
      }
    }

    return serverErrorResponse();
  }
}

export { DeleteTransactionController };
