module.exports = class CreditIndex {
  constructor({ database, table }) {
    this.database = database;
    this.table = table;
  }
  async execute(userId) {
    const walletsIds = await this.database('wallet')
      .where({ user_id: userId })
      .select('id')
      .then(data => data.map(a => a.id));

    const creditsOrDebt = await this.database(this.table)
      .whereIn(`${this.table}.wallet_id`, walletsIds)
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
      .select(
        `${this.table}.id AS ${this.table}_id`,
        `${this.table}.amount_necessary`,
        `${this.table}.from`,
        `${this.table}.wallet_id`,
        `${this.table}.description`,
        `transaction.amount`,
        `${this.table}.dateNow`,
        `${this.table}.deadline`
      );

    const tratedObjects = creditsOrDebt.reduce((iterator, object, index) => {
      const verifyObjectAlreadyExist = object => {
        const objectFind = iterator.findIndex(
          creditOrDebt =>
            creditOrDebt[`${this.table}_id`] == object[`${this.table}_id`]
        );
        if (!objectFind) {
          iterator[objectFind].amount += object.amount;
          return iterator;
        } else {
          iterator.push(object);
        }
      };
      index == 0 ? iterator.push(object) : verifyObjectAlreadyExist(object);
      return iterator;
    }, []);

    return tratedObjects;
  }
};
