import { IListTransactionUseCase } from '../../domain/use-cases/IListTransactionUseCase';
import {
  HttpRequest,
  HttpResponse,
} from '../../../shared/presentation/protocols';
import {
  notFoundResponse,
  okResponse,
  serverErrorResponse,
} from '../../../shared/presentation/helpers';
import { TransactionNotFoundError } from '../../domain/use-cases/errors';

class ListTransactionController {
  constructor(private listTransactionUseCase: IListTransactionUseCase) {}

  async handleRequest(request: HttpRequest): Promise<HttpResponse> {
    try {
      const transaction = await this.listTransactionUseCase.list(
        request.params.id
      );

      return okResponse(transaction);
    } catch (err) {
      if (err.message === new TransactionNotFoundError().message) {
        return notFoundResponse(err.message);
      }

      return serverErrorResponse();
    }
  }
}

export { ListTransactionController };
