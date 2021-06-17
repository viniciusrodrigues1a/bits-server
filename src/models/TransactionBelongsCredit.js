const TransactionBuilder = require('./Transaction');

module.exports = class TransactionBelongsCredit extends TransactionBuilder {
  constructor(database) {
    super(database);
  }

  async store(data) {
    const { wallet_id, debt_or_credit_id, ...rest } = data;

    await this.verifyWalletExist(wallet_id);

    const [transaction_belongs] = await this.insertDebtId({
      debt_or_credit_id,
    });

    const transaction = super.store({
      ...rest,
      transaction_belongs,
      wallet_id,
    });

    return transaction;
  }

  async insertDebtId(debt_or_credit_id) {
    return await this.database('create_credit_or_debt_transaction')
      .insert(debt_or_credit_id)
      .returning('id');
  }
};
