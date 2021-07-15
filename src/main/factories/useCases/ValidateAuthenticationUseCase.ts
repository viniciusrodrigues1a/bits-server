import { ValidateAuthenticationUseCase } from '../../../modules/accounts/domain/use-cases/';
import { makeFindOneAccountRepository } from '../repositories';
import { makeAuthenticationValidator } from '../validators';

export function makeValidateAuthenticationUseCase() {
  const useCase = new ValidateAuthenticationUseCase(
    makeAuthenticationValidator(),
    makeFindOneAccountRepository()
  );
  return useCase;
}
