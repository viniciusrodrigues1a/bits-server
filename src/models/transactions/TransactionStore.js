const TransactionVerifyWalletExist = require('./methods/TransactionVerifyWalletExist');

module.exports = class TransactionStore {
  constructor(database) {
    this.database = database;
  }

  async store(data) {
    const { wallet_id } = data;

    await TransactionVerifyWalletExist(this.database, wallet_id);

    const [transaction] = await this.database('transaction')
      .insert({
        ...data,
      })
      .returning('*');

    return transaction;
  }

  async update(amount, description, id) {
    const [updatedTransaction] = await this.database('transaction')
      .where({ id })
      .update({
        amount,
        description,
      })
      .returning('*');

    return updatedTransaction;
  }
};
