module.exports = class TransactionBuilder {
  constructor(database) {
    this.database = database;
  }

  async store(
    amount,
    incoming,
    categoryId,
    walletId,
    description,
    debtId = null
  ) {
    const [transaction_belongs] = await this.database(
      'create_credit_or_debt_transaction'
    )
      .insert({
        debt_id: debtId,
      })
      .returning('id');

    const [transaction] = await this.database('transaction')
      .insert({
        category_id: categoryId,
        wallet_id: walletId,
        amount,
        incoming,
        description,
        transaction_belongs,
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
  async setTypeTransaction(typeTransaction) {
    console.log(response);
  }
  removeAmountWallet() {}
};
