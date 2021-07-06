import { mock } from 'jest-mock-extended';
import {
  ICreateTransactionRepository,
  IFindOneWalletRepository,
} from '../repositories';
import { CreateTransactionUseCase } from './CreateTransactionUseCase';

describe('Use-case for Transaction creation', () => {
  it('should return a Transaction', async () => {
    const createTransactionRepositoryMock = mock<ICreateTransactionRepository>();
    const findOneWalletRepositoryMock = mock<IFindOneWalletRepository>();
    const sut = new CreateTransactionUseCase(
      createTransactionRepositoryMock,
      findOneWalletRepositoryMock
    );

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
});
