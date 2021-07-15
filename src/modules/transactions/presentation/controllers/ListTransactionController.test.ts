import { mock } from 'jest-mock-extended';
import { IListTransactionUseCase } from '../../domain/use-cases/IListTransactionUseCase';
import { statusCodes } from '../../../shared/presentation/helpers';
import { ListTransactionController } from './ListTransactionController';
import { TransactionNotFoundError } from '../../domain/use-cases/errors';

function makeSut() {
  const listTransactionUseCaseMock = mock<IListTransactionUseCase>();
  const sut = new ListTransactionController(listTransactionUseCaseMock);

  return { sut, listTransactionUseCaseMock };
}

describe('ListTransactionController', () => {
  it('should return status code Ok', async () => {
    const { sut } = makeSut();

    const response = await sut.handleRequest({ params: 1 });

    expect(response.statusCode).toBe(statusCodes.ok);
  });

  it('should return status code BadRequest if request has missing fields', async () => {
    const { sut } = makeSut();

    const response = await sut.handleRequest({});

    expect(response.statusCode).toBe(statusCodes.badRequest);
  });

  it('should return status code NotFound if TransactionNotFoundError is thrown', async () => {
    const { sut, listTransactionUseCaseMock } = makeSut();

    listTransactionUseCaseMock.list.mockImplementationOnce(() => {
      throw new TransactionNotFoundError();
    });

    const response = await sut.handleRequest({ params: 1 });

    expect(response.statusCode).toBe(statusCodes.notFound);
  });

  it('should return status code ServerError if a generic Error is thrown', async () => {
    const { sut, listTransactionUseCaseMock } = makeSut();

    listTransactionUseCaseMock.list.mockImplementationOnce(() => {
      throw new Error('Server-side error');
    });

    const response = await sut.handleRequest({ params: 1 });

    expect(response.statusCode).toBe(statusCodes.serverError);
  });
});
