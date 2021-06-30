const getCreditOrDebt = require('./methods/getCreditOrDebt');

const Dinero = require('dinero.js');

const showCredit = require('./methods/indexCredit');
module.exports = class CreditDestroy {
  constructor({ database, table }) {
    this.database = database;
    this.table = table;
  }

  async execute(creditOrDebtId) {
    await getCreditOrDebt(this.database, this.table, creditOrDebtId);

    const [{ wallet_id, amount: amountHave }] = await showCredit(
      this.database,
      this.table,
      creditOrDebtId
    );

    await this.database.transaction(async trx => {
      try {
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
          .del();

        await this.database(this.table).where({ id: creditOrDebtId }).del();

        const { balance, currency } = await this.database('wallet')
          .where({ id: wallet_id })
          .select('*')
          .first();

        const extorningAmountInWallet = Dinero({
          amount: balance,
          currency: currency,
        }).subtract(Dinero({ amount: amountHave, currency }));

        await this.database('wallet')
          .transacting(trx)
          .where({ id: wallet_id })
          .update({ balance: extorningAmountInWallet.getAmount() });
      } catch (err) {
        await trx.rollback();
      }
      await trx.commit();
    });
  }
};
