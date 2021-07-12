import { mock } from 'jest-mock-extended';
import {
  IDeleteTransactionRepository,
  IFindOneTransactionRepository,
} from '../repositories';
import { DeleteTransactionUseCase } from './DeleteTransactionUseCase';
import { TransactionNotFoundError } from './errors';

function makeSut() {
  const findOneTransactionRepositoryMock = mock<IFindOneTransactionRepository>();
  const deleteTransactionRepositoryMock = mock<IDeleteTransactionRepository>();
  const sut = new DeleteTransactionUseCase(
    findOneTransactionRepositoryMock,
    deleteTransactionRepositoryMock
  );

  return {
    sut,
    findOneTransactionRepositoryMock,
    deleteTransactionRepositoryMock,
  };
}

describe('Use-case for deleting a Transaction', () => {
  it('should delete a Transaction', async () => {
    const { sut, findOneTransactionRepositoryMock } = makeSut();

    findOneTransactionRepositoryMock.findOne.mockResolvedValueOnce({
      amount: 11300,
      walletId: 1,
      categoryId: 1,
    });

    const response = await sut.delete(1);

    await expect(response).toBe(true);
  });

  it("should throw TransactionNotFoundError if Transaction doesn't exist", async () => {
    const { sut, findOneTransactionRepositoryMock } = makeSut();

    findOneTransactionRepositoryMock.findOne.mockResolvedValueOnce(undefined);

    await expect(sut.delete(1)).rejects.toThrow(new TransactionNotFoundError());
  });
});
