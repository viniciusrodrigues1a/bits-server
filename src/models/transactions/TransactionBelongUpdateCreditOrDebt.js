const Dinero = require('dinero.js');
const verifyAmountForOperationInWallet = require('../wallet/methods/verifyAmountForOperationInWallet');

module.exports = class TransactionBelongsUpdateCreditOrDebt {
  constructor(database) {
    this.database = database;
  }

  async execute(data) {
    const { transaction_id, newAmount, description = null } = data;

    const oldTransaction = await this.database('transaction')
      .where({ id: transaction_id })
      .select('*')
      .first();

    if (!oldTransaction) {
      throw new Error('transaction not found');
    }

    let balance, currency;

    const { wallet_id: transaction_wallet_id, amount: oldAmount } =
      oldTransaction;
    if (newAmount) {
      const {
        balance: balanceTransactionWallet,
        currency: currencyTransactionWallet,
      } = await verifyAmountForOperationInWallet(
        this.database,
        newAmount,
        transaction_wallet_id
      );

      if (!balanceTransactionWallet) {
        throw new Error('wallet dont enought found');
      }
      balance = balanceTransactionWallet;
      currency = currencyTransactionWallet;
    }

    // const { balance: balanceCreditWallet, currency: currencyCrediWallet } =
    //   await this.database('wallet')
    //     .where({
    //       id: wallet_id,
    //     })
    //     .select('*')
    //     .first();

    const oldBalanceTransactionWallet = Dinero({
      amount: balance,
      currency: currency,
    }).subtract(Dinero({ amount: oldAmount, currency }));

    const newBalanceTransactionWallet = Dinero({
      amount: oldBalanceTransactionWallet.getAmount(),
      currency,
    }).add(Dinero({ amount: newAmount, currency }));

    // const oldBalanceCreditWallet = Dinero({
    //   amount: balanceCreditWallet,
    //   currency: currencyCrediWallet,
    // }).subtract(Dinero({ amount: oldAmount, currency: currencyCrediWallet }));

    // const newBalanceCreditWallet = Dinero({
    //   amount: oldBalanceCreditWallet.getAmount(),
    //   currency: currencyCrediWallet,
    // }).add(Dinero({ amount: newAmount, currency: currencyCrediWallet }));

    await this.database.transaction(async trx => {
      try {
        await this.database('transaction')
          .transacting(trx)
          .where({ id: transaction_id })
          .update({ amount: newAmount, description });

        await this.database('wallet')
          .transacting(trx)
          .where({ id: transaction_wallet_id })
          .update({
            balance: oldBalanceTransactionWallet.getAmount(),
          })
          .returning('*');

        await this.database('wallet')
          .transacting(trx)
          .where({ id: transaction_wallet_id })
          .update({
            balance: newBalanceTransactionWallet.getAmount(),
          });

        // if (transaction_wallet_id === wallet_id) {
        //   return await trx.commit();
        // }

        // await this.database('wallet')
        //   .transacting(trx)
        //   .where({ id: wallet_id })
        //   .update({
        //     balance: oldBalanceCreditWallet.getAmount(),
        //   })
        //   .returning('*');

        // await this.database('wallet')
        //   .transacting(trx)
        //   .where({ id: wallet_id })
        //   .update({
        //     balance: newBalanceCreditWallet.getAmount(),
        //   });
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
