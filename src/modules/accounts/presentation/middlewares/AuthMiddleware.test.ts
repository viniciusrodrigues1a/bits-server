import { mock } from 'jest-mock-extended';
import { IValidateAuthenticationUseCase } from 'modules/accounts/domain/use-cases/IValidateAuthenticationUseCase';
import {
  AccountNotFoundError,
  InvalidTokenError,
} from '../../domain/use-cases/errors';
import { statusCodes } from '../../../shared/presentation/helpers';
import { AuthMiddleware } from './AuthMiddleware';

function makeSut() {
  const validateAuthenticationUseCaseMock = mock<IValidateAuthenticationUseCase>();
  const sut = new AuthMiddleware(validateAuthenticationUseCaseMock);

  return { sut, validateAuthenticationUseCaseMock };
}

describe('AuthMiddleware', () => {
  it('should return status code Ok', async () => {
    const { sut } = makeSut();

    const response = await sut.handleRequest({
      headers: { Authentication: 'my token' },
    });

    expect(response.statusCode).toBe(statusCodes.ok);
  });

  it('should return status code NotFound if AccountNotFoundError is thrown', async () => {
    const { sut, validateAuthenticationUseCaseMock } = makeSut();

    validateAuthenticationUseCaseMock.validate.mockImplementationOnce(() => {
      throw new AccountNotFoundError();
    });

    const response = await sut.handleRequest({
      headers: { Authentication: 'my token' },
    });

    expect(response.statusCode).toBe(statusCodes.notFound);
  });

  it('should return status code Unauthorized if InvalidTokenError is thrown', async () => {
    const { sut, validateAuthenticationUseCaseMock } = makeSut();

    validateAuthenticationUseCaseMock.validate.mockImplementationOnce(() => {
      throw new InvalidTokenError();
    });

    const response = await sut.handleRequest({
      headers: { Authentication: 'my token' },
    });

    expect(response.statusCode).toBe(statusCodes.unauthorized);
  });

  it('should return status code ServerError if a generic Error is thrown', async () => {
    const { sut, validateAuthenticationUseCaseMock } = makeSut();

    validateAuthenticationUseCaseMock.validate.mockImplementationOnce(() => {
      throw new Error('Server-side error');
    });

    const response = await sut.handleRequest({
      headers: { Authentication: 'my token' },
    });

    expect(response.statusCode).toBe(statusCodes.serverError);
  });
});
