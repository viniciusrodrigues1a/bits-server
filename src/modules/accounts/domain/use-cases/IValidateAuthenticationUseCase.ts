import { Account } from '../models/Account';

interface IValidateAuthenticationUseCase {
  validate(token: string): Promise<Account>;
}

export { IValidateAuthenticationUseCase };
