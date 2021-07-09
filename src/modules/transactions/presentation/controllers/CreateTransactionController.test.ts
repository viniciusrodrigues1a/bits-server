import { mock } from 'jest-mock-extended';
import { ICreateTransactionUseCase } from 'modules/transactions/domain/use-cases/ICreateTransactionUseCase';
import { statusCodes } from '../helpers';
import { CreateTransactionController } from './CreateTransactionController';

describe('CreateTransactionController', () => {
  it('should return an okResponse', async () => {
    const createTransactionUseCaseMock = mock<ICreateTransactionUseCase>();
    const sut = new CreateTransactionController(createTransactionUseCaseMock);

    const response = await sut.handleRequest({ body: {} });

    expect(response.statusCode).toBe(statusCodes.ok);
  });
});
