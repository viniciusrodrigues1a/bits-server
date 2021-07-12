import { mock } from 'jest-mock-extended';
import {
  ICreateTransactionRepository,
  IFindOneCategoryRepository,
  IFindOneWalletRepository,
} from '../repositories';
import { CreateTransactionUseCase } from './CreateTransactionUseCase';
import { WalletNotFoundError, CategoryNotFoundError } from './errors';

function makeSut() {
  const createTransactionRepositoryMock = mock<ICreateTransactionRepository>();
  const findOneWalletRepositoryMock = mock<IFindOneWalletRepository>();
  const findOneCategoryRepositoryMock = mock<IFindOneCategoryRepository>();
  const sut = new CreateTransactionUseCase(
    createTransactionRepositoryMock,
    findOneWalletRepositoryMock,
    findOneCategoryRepositoryMock
  );

  return {
    sut,
    createTransactionRepositoryMock,
    findOneWalletRepositoryMock,
    findOneCategoryRepositoryMock,
  };
}

describe('Use-case for Transaction creation', () => {
  it('should return a Transaction', async () => {
    const {
      sut,
      createTransactionRepositoryMock,
      findOneWalletRepositoryMock,
      findOneCategoryRepositoryMock,
    } = makeSut();

    findOneWalletRepositoryMock.findOne.mockReturnValueOnce(
      new Promise((resolve, _) => resolve({}))
    );

    findOneCategoryRepositoryMock.findOne.mockResolvedValue({});

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
    const {
      sut,
      findOneWalletRepositoryMock,
      findOneCategoryRepositoryMock,
    } = makeSut();

    findOneWalletRepositoryMock.findOne.mockReturnValueOnce(
      new Promise((resolve, _) => resolve(undefined))
    );

    findOneCategoryRepositoryMock.findOne.mockResolvedValue({});

    await expect(
      sut.create({
        amount: 1100,
        description: 'My new phone',
        walletId: 1,
        categoryId: 1,
      })
    ).rejects.toThrowError(new WalletNotFoundError());
  });

  it("should throw CategoryNotFoundError if category doesn't exist", async () => {
    const {
      sut,
      findOneWalletRepositoryMock,
      findOneCategoryRepositoryMock,
    } = makeSut();

    findOneWalletRepositoryMock.findOne.mockResolvedValue({});
    findOneCategoryRepositoryMock.findOne.mockResolvedValue(undefined);

    await expect(
      sut.create({
        amount: 1100,
        description: 'My new phone',
        walletId: 1,
        categoryId: 1,
      })
    ).rejects.toThrowError(new CategoryNotFoundError());
  });
});
