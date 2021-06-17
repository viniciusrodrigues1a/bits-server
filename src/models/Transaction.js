module.exports = class TransactionBuilder {
  constructor(database) {
    this.database = database;
  }

  async store(data) {
    const { wallet_id } = data;

    await this.verifyWalletExist(wallet_id);

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

  async destroy(id) {
    await this.database('transaction').where({ id }).del();
  }

  async testing() {
    console.log('oie');
  }

  async verifyWalletExist(wallet_id) {
    const wallet = await this.database('wallet')
      .where({
        id: wallet_id,
      })
      .select('*')
      .first();

    if (!wallet) {
      throw new Error('wallet not found');
    }
  }
};
