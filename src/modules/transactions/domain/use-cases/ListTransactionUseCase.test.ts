import { mock } from 'jest-mock-extended';
import { IFindOneTransactionRepository } from '../repositories';
import { TransactionNotFoundError } from './errors';
import { ListTransactionUseCase } from './ListTransactionUseCase';

function makeSut() {
  const findOneTransactionRepositoryMock = mock<IFindOneTransactionRepository>();
  const sut = new ListTransactionUseCase(findOneTransactionRepositoryMock);

  return { sut, findOneTransactionRepositoryMock };
}

describe('ListTransactionUseCase', () => {
  it('should return Transaction', async () => {
    const { sut, findOneTransactionRepositoryMock } = makeSut();

    findOneTransactionRepositoryMock.findOne.mockResolvedValueOnce({
      amount: 11330,
      walletId: 1,
      categoryId: 1,
    });

    const transaction = await sut.list(1);

    expect(transaction.amount).toBe(11330);
  });

  it("should throw TransactionNotFoundError if Transaction doesn't exist", async () => {
    const { sut, findOneTransactionRepositoryMock } = makeSut();

    findOneTransactionRepositoryMock.findOne.mockResolvedValueOnce(undefined);

    await expect(sut.list(1)).rejects.toThrow(new TransactionNotFoundError());
  });
});
