export class WalletNotFoundError extends Error {
  constructor() {
    const message = 'Wallet not found';
    super(message);
    this.message = message;
  }
}
