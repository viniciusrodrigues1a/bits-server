module.exports = class CreditShow {
  constructor({ database, table }) {
    this.database = database;
    this.table = table;
  }
  async execute(userId, creditOrDebtId) {
    console.log(this.table, creditOrDebtId);
    const walletsIds = await this.database('wallet')
      .where({ user_id: userId })
      .select('id')
      .then(data => data.map(a => a.id));

    const transactions = await this.database(
      'create_credit_or_debt_transaction'
    )
      .whereIn('transaction.wallet_id', walletsIds)
      .andWhere(
        'create_credit_or_debt_transaction.debt_or_credit_id',
        creditOrDebtId
      )
      .leftJoin(
        'transaction',
        'transaction.transaction_belongs',
        '=',
        'create_credit_or_debt_transaction.id'
      );

    return transactions;
  }
};
