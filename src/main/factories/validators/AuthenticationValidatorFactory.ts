import { JwtAuthenticationValidator } from '../../../modules/accounts/data/validators';

export function makeAuthenticationValidator() {
  const validator = new JwtAuthenticationValidator();
  return validator;
}
