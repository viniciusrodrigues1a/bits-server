const Dinero = require('dinero.js');
const verifyAmountForOperationInWallet = require('../wallet/methods/verifyAmountForOperationInWallet');
const TransactionVerifyWalletExist = require('./methods/TransactionVerifyWalletExist');

module.exports = class TransactionStore {
  constructor(database) {
    this.database = database;
  }

  async execute(data) {
    const { wallet_id, amount, ...rest } = data;

    await TransactionVerifyWalletExist(this.database, wallet_id);

    const wallet = await verifyAmountForOperationInWallet(
      this.database,
      amount,
      wallet_id
    );

    const { balance: balanceWallet, currency } = wallet;

    let transaction;
    await this.database.transaction(async trx => {
      try {
        transaction = await this.database('transaction')
          .transacting(trx)
          .insert({
            ...rest,
            wallet_id,
            amount,
          })
          .returning('*');

        const newBalance = Dinero({
          amount: balanceWallet,
          currency,
        }).add(Dinero({ amount, currency }));

        await this.database('wallet')
          .transacting(trx)
          .where({ id: wallet_id })
          .update({ balance: newBalance.getAmount() });
      } catch (err) {
        await trx.rollback();
      }
      await trx.commit();
    });

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
