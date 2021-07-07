import { mock } from 'jest-mock-extended';
import {
  ICreateTransactionRepository,
  IFindOneWalletRepository,
} from '../repositories';
import { CreateTransactionUseCase } from './CreateTransactionUseCase';
import { WalletNotFoundError } from './errors';

function makeSut() {
  const createTransactionRepositoryMock = mock<ICreateTransactionRepository>();
  const findOneWalletRepositoryMock = mock<IFindOneWalletRepository>();
  const sut = new CreateTransactionUseCase(
    createTransactionRepositoryMock,
    findOneWalletRepositoryMock
  );

  return { sut, createTransactionRepositoryMock, findOneWalletRepositoryMock };
}

describe('Use-case for Transaction creation', () => {
  it('should return a Transaction', async () => {
    const {
      sut,
      createTransactionRepositoryMock,
      findOneWalletRepositoryMock,
    } = makeSut();

    findOneWalletRepositoryMock.findOne.mockReturnValueOnce(
      new Promise((resolve, _) => resolve({}))
    );

    createTransactionRepositoryMock.create.mockImplementationOnce(
      data => new Promise((resolve, _) => resolve(data))
    );

    const transaction = await sut.create({
      amount: 1100,
      description: 'My new phone',
      walletId: 1,
      categoryId: 1,
    });

    expect(transaction.description).toEqual('My new phone');
  });

  it("should throw WalletNotFoundError if wallet doesn't exist", async () => {
    const { sut, findOneWalletRepositoryMock } = makeSut();

    findOneWalletRepositoryMock.findOne.mockReturnValueOnce(
      new Promise((resolve, _) => resolve(undefined))
    );

    await expect(
      sut.create({
        amount: 1100,
        description: 'My new phone',
        walletId: 1,
        categoryId: 1,
      })
    ).rejects.toThrowError(new WalletNotFoundError());
  });
});
