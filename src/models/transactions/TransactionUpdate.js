const Dinero = require('dinero.js');
const verifyAmountForOperationInWallet = require('../wallet/methods/verifyAmountForOperationInWallet');

module.exports = class TransactionUpdate {
  constructor(database) {
    this.database = database;
  }

  async execute(data) {
    const { newAmount, transaction_id, ...rest } = data;

    const oldTransaction = await this.database('transaction')
      .where({ id: transaction_id })
      .select('*')
      .first();

    if (!oldTransaction) {
      throw new Error('transaction not found');
    }
    const { wallet_id, amount: oldAmount } = oldTransaction;
    const { balance, currency } = await verifyAmountForOperationInWallet(
      this.database,
      newAmount,
      wallet_id
    );

    if (!balance) {
      throw new Error('wallet dont enought found');
    }

    const oldBalance = Dinero({
      amount: balance,
      currency,
    }).subtract(Dinero({ amount: oldAmount, currency }));

    const newBalance = Dinero({
      amount: balance,
      currency,
    }).add(Dinero({ amount: newAmount, currency }));

    await this.database.transaction(async trx => {
      try {
        await this.database('wallet')
          .transacting(trx)
          .where({ id: wallet_id })
          .update({
            balance: oldBalance.getAmount(),
            ...rest,
          })
          .returning('*');

        await this.database('transaction')
          .transacting(trx)
          .where({ id: transaction_id })
          .update({ amount: newAmount, ...rest });

        await this.database('wallet')
          .transacting(trx)
          .where({ id: wallet_id })
          .update({
            balance: newBalance.getAmount(),
          });
      } catch (err) {
        console.log(err);
        await trx.rollback();
      }
      await trx.commit();
    });

    const updatedTransaction = await this.database('transaction')
      .where({ id: transaction_id })
      .select('*')
      .first();

    return updatedTransaction;
  }
};
