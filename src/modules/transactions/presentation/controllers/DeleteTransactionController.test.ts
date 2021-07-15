import { mock } from 'jest-mock-extended';
import { TransactionNotFoundError } from '../../domain/use-cases/errors';
import { IDeleteTransactionUseCase } from '../../domain/use-cases/IDeleteTransactionUseCase';
import { statusCodes } from '../../../shared/presentation/helpers';
import { DeleteTransactionController } from './DeleteTransactionController';

function makeSut() {
  const deleteTransactionUseCaseMock = mock<IDeleteTransactionUseCase>();
  const sut = new DeleteTransactionController(deleteTransactionUseCaseMock);

  return { sut, deleteTransactionUseCaseMock };
}

describe('DeleteTransactionController', () => {
  it('should return status code noContent', async () => {
    const { sut } = makeSut();

    const response = await sut.handleRequest({ params: { id: 1 } });

    expect(response.statusCode).toBe(statusCodes.noContent);
  });

  it('should return notFound if TransactionNotFoundError is thrown', async () => {
    const { sut, deleteTransactionUseCaseMock } = makeSut();

    deleteTransactionUseCaseMock.delete.mockImplementationOnce(() => {
      throw new TransactionNotFoundError();
    });

    const response = await sut.handleRequest({ params: { id: 1 } });

    expect(response.statusCode).toBe(statusCodes.notFound);
  });

  it('should return serverError if a generic Error is thrown, async', async () => {
    const { sut, deleteTransactionUseCaseMock } = makeSut();

    deleteTransactionUseCaseMock.delete.mockImplementationOnce(() => {
      throw new Error('Something went wrong on the server side');
    });

    const response = await sut.handleRequest({ params: { id: 1 } });

    expect(response.statusCode).toBe(statusCodes.serverError);
  });
});
