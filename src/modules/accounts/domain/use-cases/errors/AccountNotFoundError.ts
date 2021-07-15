export class AccountNotFoundError extends Error {
  constructor() {
    const message = 'Account was not found';
    super(message);
    this.message = message;
  }
}
