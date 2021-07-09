import { ICreateTransactionUseCase } from '../../domain/use-cases/ICreateTransactionUseCase';
import { okResponse } from '../helpers';
import { HttpRequest, HttpResponse } from '../protocols';

class CreateTransactionController {
  constructor(private createTransactionUseCase: ICreateTransactionUseCase) {}

  async handleRequest(request: HttpRequest): Promise<HttpResponse> {
    const transaction = await this.createTransactionUseCase.create(
      request.body
    );

    return okResponse(transaction);
  }
}

export { CreateTransactionController };
