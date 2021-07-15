import { Account } from '../models/Account';
import { IFindOneAccountRepository } from '../repositories';
import { IAuthenticationValidator } from '../validators';
import { AccountNotFoundError, InvalidTokenError } from './errors';
import { IValidateAuthenticationUseCase } from './IValidateAuthenticationUseCase';

class ValidateAuthenticationUseCase implements IValidateAuthenticationUseCase {
  constructor(
    private authenticationValidator: IAuthenticationValidator,
    private findOneAccountRepository: IFindOneAccountRepository
  ) {}

  async validate(token: string): Promise<Account> {
    const decodedAccountId = await this.authenticationValidator.validate(token);
    if (!decodedAccountId) {
      throw new InvalidTokenError();
    }

    const account = await this.findOneAccountRepository.findOne(
      decodedAccountId
    );

    if (!account) {
      throw new AccountNotFoundError();
    }

    return account;
  }
}

export { ValidateAuthenticationUseCase };
