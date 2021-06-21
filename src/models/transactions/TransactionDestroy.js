const verifyAmountForOperationInWallet = require('../wallet/methods/verifyAmountForOperationInWallet');
const Dinero = require('dinero.js');
module.exports = class TransactionDestroy {
  constructor(database) {
    this.database = database;
  }

  async execute(transaction_id) {
    const oldTransaction = await this.database('transaction')
      .where({ id: 3 })
      .select('*')
      .first();

    if (!oldTransaction) {
      throw new Error('transaction not found');
    }
    const { wallet_id, amount: oldAmount } = oldTransaction;

    const { balance, currency } = await verifyAmountForOperationInWallet(
      this.database,
      oldAmount,
      wallet_id
    );

    if (!balance) {
      throw new Error(
        'impossible revert transaction, because wallet dont have amount necessary'
      );
    }

    const newBalance = Dinero({
      amount: balance,
      currency,
    }).subtract(Dinero({ amount: oldAmount, currency }));

    await this.database.transaction(async trx => {
      try {
        await this.database('transaction')
          .transacting(trx)
          .where({ id: transaction_id })
          .del();

        await this.database('wallet')
          .transacting(trx)
          .where({ id: wallet_id })
          .update({
            balance: newBalance.getAmount(),
          })
          .returning('*');
      } catch (err) {
        await trx.rollback();
      }
      await trx.commit();
    });
  }
};
