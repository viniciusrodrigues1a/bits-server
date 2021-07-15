import { IAuthenticationValidator } from '../../domain/validators';

const jwtHelper = require('./jwtHelper.js');

class JwtAuthenticationValidator implements IAuthenticationValidator {
  async validate(token: string): Promise<number | undefined> {
    if (!token) {
      return undefined;
    }

    const tokenHash = token.split(' ')[1];

    try {
      const decoded = await jwtHelper.verify(tokenHash);

      return decoded.id;
    } catch (err) {
      return undefined;
    }
  }
}

export { JwtAuthenticationValidator };
