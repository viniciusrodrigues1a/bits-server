import { mock } from 'jest-mock-extended';
import { IFindOneAccountRepository } from '../repositories';
import { IAuthenticationValidator } from '../validators';
import { AccountNotFoundError, InvalidTokenError } from './errors';
import { ValidateAuthenticationUseCase } from './ValidateAuthenticationUseCase';

function makeSut() {
  const authenticationValidatorMock = mock<IAuthenticationValidator>();
  const findOneAccountRepositoryMock = mock<IFindOneAccountRepository>();
  const sut = new ValidateAuthenticationUseCase(
    authenticationValidatorMock,
    findOneAccountRepositoryMock
  );

  return {
    sut,
    authenticationValidatorMock,
    findOneAccountRepositoryMock,
  };
}

describe('Use-case to validate if user is authenticated', () => {
  it('should return Account', async () => {
    const {
      sut,
      authenticationValidatorMock,
      findOneAccountRepositoryMock,
    } = makeSut();

    authenticationValidatorMock.validate.mockResolvedValueOnce(1);
    findOneAccountRepositoryMock.findOne.mockResolvedValueOnce({
      name: 'Jorge',
      email: 'jorge@email.com',
    });

    const account = await sut.validate('my valid token');

    expect(account.name).toBe('Jorge');
  });

  it('should throw InvalidTokenError if token is invalid', async () => {
    const {
      sut,
      authenticationValidatorMock,
      findOneAccountRepositoryMock,
    } = makeSut();

    authenticationValidatorMock.validate.mockResolvedValueOnce(undefined);
    findOneAccountRepositoryMock.findOne.mockResolvedValueOnce({
      name: 'Jorge',
      email: 'jorge@email.com',
    });

    await expect(sut.validate('my INVALID token')).rejects.toThrow(
      new InvalidTokenError()
    );
  });

  it("should throw AccountNotFoundError if account doesn't exist", async () => {
    const {
      sut,
      authenticationValidatorMock,
      findOneAccountRepositoryMock,
    } = makeSut();

    authenticationValidatorMock.validate.mockResolvedValueOnce(1);
    findOneAccountRepositoryMock.findOne.mockResolvedValueOnce(undefined);

    await expect(sut.validate('my INVALID token')).rejects.toThrow(
      new AccountNotFoundError()
    );
  });
});
