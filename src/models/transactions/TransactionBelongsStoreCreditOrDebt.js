const TransactionVerifyWalletExist = require('./methods/TransactionVerifyWalletExist');
const verifyAmountForOperationInWallet = require('../wallet/methods/verifyAmountForOperationInWallet');
const Dinero = require('dinero.js');
module.exports = class TransactionBelongsCreditOrDebt {
  constructor(database) {
    this.database = database;
  }

  async store(data) {
    const { wallet_id, debt_or_credit_id, amount, ...rest } = data;

    await TransactionVerifyWalletExist(this.database, wallet_id);

    const { balance, currency } = await verifyAmountForOperationInWallet(
      this.database,
      amount,
      wallet_id
    );
    console.log('pato');
    if (!balance) {
      throw new Error('wallet dont enought found');
    }

    let transaction;
    await this.database.transaction(async trx => {
      try {
        const [transaction_belongs] = await this.database(
          'create_credit_or_debt_transaction'
        )
          .transacting(trx)
          .insert({ debt_or_credit_id })
          .returning('id');

        transaction = await this.database('transaction')
          .transacting(trx)
          .insert({
            ...rest,
            amount,
            wallet_id,
            transaction_belongs,
          })
          .returning('*');
        console.log(amount, 'OLHA O AMOUNT AI');
        const newBalance = Dinero({
          amount: balance,
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

  async insertDebtId(debt_or_credit_id) {
    return await this.database('create_credit_or_debt_transaction')
      .insert(debt_or_credit_id)
      .returning('id');
  }
};
