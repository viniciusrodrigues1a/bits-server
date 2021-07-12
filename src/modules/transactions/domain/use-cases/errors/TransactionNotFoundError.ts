export class TransactionNotFoundError extends Error {
  constructor() {
    const message = 'Transaction not found';
    super(message);
    this.message = message;
  }
}
