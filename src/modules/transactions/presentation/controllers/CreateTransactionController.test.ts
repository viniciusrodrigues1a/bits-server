import { mock } from 'jest-mock-extended';
import {
  CategoryNotFoundError,
  WalletNotFoundError,
} from '../../domain/use-cases/errors';
import { ICreateTransactionUseCase } from '../..//domain/use-cases/ICreateTransactionUseCase';
import { statusCodes } from '../helpers';
import { CreateTransactionController } from './CreateTransactionController';

function makeSut() {
  const createTransactionUseCaseMock = mock<ICreateTransactionUseCase>();
  const sut = new CreateTransactionController(createTransactionUseCaseMock);

  return { sut, createTransactionUseCaseMock };
}

describe('CreateTransactionController', () => {
  it('should return an okResponse', async () => {
    const { sut } = makeSut();

    const response = await sut.handleRequest({ body: {} });

    expect(response.statusCode).toBe(statusCodes.ok);
  });

  it('should return notFound if use-case throws WalletNotFoundError', async () => {
    const { sut, createTransactionUseCaseMock } = makeSut();

    createTransactionUseCaseMock.create.mockImplementationOnce(() => {
      throw new WalletNotFoundError();
    });

    const response = await sut.handleRequest({ body: {} });

    expect(response.statusCode).toBe(statusCodes.notFound);
  });

  it('should return notFound if use-case throws CategoryNotFoundError', async () => {
    const { sut, createTransactionUseCaseMock } = makeSut();

    createTransactionUseCaseMock.create.mockImplementationOnce(() => {
      throw new CategoryNotFoundError();
    });

    const response = await sut.handleRequest({ body: {} });

    expect(response.statusCode).toBe(statusCodes.notFound);
  });

  it("should return serverError if use-case throws an error we're not handling", async () => {
    const { sut, createTransactionUseCaseMock } = makeSut();

    createTransactionUseCaseMock.create.mockImplementationOnce(() => {
      throw new Error('Something went wrong on the server side');
    });

    const response = await sut.handleRequest({ body: {} });

    expect(response.statusCode).toBe(statusCodes.serverError);
  });
});
