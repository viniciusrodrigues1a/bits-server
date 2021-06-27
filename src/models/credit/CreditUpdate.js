const getCreditOrDebt = require('./methods/getCreditOrDebt');

const Dinero = require('dinero.js');
const indexCredit = require('./methods/indexCredit');
module.exports = class CreditUpdate {
  constructor({ database, table }) {
    this.database = database;
    this.table = table;
  }

  async execute(data) {
    const { creditOrDebtId, walletId, ...rest } = data;

    await getCreditOrDebt(this.database, this.table, creditOrDebtId);

    const [{ amount: amountHave, wallet_id: old_wallet_id }] =
      await indexCredit(this.database, this.table, creditOrDebtId);

    if (amountHave > rest.amount_necessary)
      throw new Error(
        'dont he can update credit, because the amount have is big in comparation to the amount necessary'
      );
    let operation;
    await this.database.transaction(async trx => {
      try {
        if (walletId) {
          const transactionIds = await this.database(this.table)

            .where(`${this.table}.id`, creditOrDebtId)
            .leftJoin(
              'create_credit_or_debt_transaction',
              'create_credit_or_debt_transaction.debt_or_credit_id',
              '=',
              `${this.table}.id`
            )
            .leftJoin(
              'transaction',
              'create_credit_or_debt_transaction.id',
              '=',
              'transaction.transaction_belongs'
            )
            .select('transaction.id')
            .then(data => data.map(transaction => transaction.id));

          await this.database('transaction')
            .transacting(trx)
            .whereIn('transaction.id', transactionIds)
            .update({ wallet_id: walletId });

          await this.database(this.table)
            .transacting(trx)
            .where({ id: creditOrDebtId })
            .update({ wallet_id: walletId });

          const { balance: balanceInOldWallet, currency: currencyInOldWallet } =
            await this.database('wallet')
              .where({ id: old_wallet_id })
              .select('*')
              .first();

          const { balance: balanceInNewWallet, currency: currencyInNewWallet } =
            await this.database('wallet')
              .where({ id: walletId })
              .select('*')
              .first();

          const newBalanceInOldWallet = Dinero({
            amount: balanceInOldWallet,
            currency: currencyInOldWallet,
          }).subtract(
            Dinero({ amount: amountHave, currency: currencyInOldWallet })
          );

          console.log(amountHave, 'OLHA O AMOUNT HAVE');

          const newBalanceInNewWallet = Dinero({
            amount: balanceInNewWallet,
            currency: currencyInNewWallet,
          }).add(Dinero({ amount: amountHave, currency: currencyInNewWallet }));

          await this.database('wallet')
            .transacting(trx)
            .where({ id: old_wallet_id })
            .update({ balance: newBalanceInOldWallet.getAmount() });
          await this.database('wallet')
            .transacting(trx)
            .where({ id: walletId })
            .update({ balance: newBalanceInNewWallet.getAmount() });
        }
        let [operationDb] = await this.database(this.table)
          .transacting(trx)
          .where({ id: creditOrDebtId })
          .update({
            ...rest,
          })
          .returning('*');
        await trx.commit();
        return (operation = operationDb);
      } catch (err) {
        console.log(err);
        await trx.rollback();
      }
    });

    return operation;
  }
};
