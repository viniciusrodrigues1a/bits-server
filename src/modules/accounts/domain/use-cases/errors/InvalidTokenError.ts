export class InvalidTokenError extends Error {
  constructor() {
    const message = 'Provided token is invalid';
    super(message);
    this.message = message;
  }
}
