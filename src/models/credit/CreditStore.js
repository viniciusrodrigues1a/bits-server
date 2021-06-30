module.exports = class CreditStore {
  constructor({ database, table }) {
    this.database = database;
    this.table = table;
  }

  async execute(data) {
    const [insertCreditOrDebt] = await this.database(this.table)
      .insert({
        ...data,
      })
      .returning('*');
    return insertCreditOrDebt;
  }
};
