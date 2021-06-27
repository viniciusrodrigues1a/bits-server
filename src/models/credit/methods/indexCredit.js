module.exports = async function showCredit(db, table, creditOrDebtId) {
  const creditOrDebt = await db(table)
    .where(`${table}.id`, creditOrDebtId)
    .leftJoin(
      'create_credit_or_debt_transaction',
      'create_credit_or_debt_transaction.debt_or_credit_id',
      '=',
      `${table}.id`
    )
    .leftJoin(
      'transaction',
      'create_credit_or_debt_transaction.id',
      '=',
      'transaction.transaction_belongs'
    )
    .select(
      `${table}.id AS debt_id`,
      `${table}.amount_necessary`,
      `${table}.from`,
      `${table}.wallet_id`,
      `${table}.description`,
      `transaction.amount`,
      `${table}.dateNow`,
      `${table}.deadline`
    );

  const tratedObjects = creditOrDebt.reduce((iterator, object, index) => {
    function verifyObjectAlreadyExist(object) {
      const objectFind = iterator.findIndex(
        creditOrDebt => creditOrDebt[`${table}_id`] == object[`${table}_id`]
      );
      if (!objectFind) {
        iterator[objectFind].amount += object.amount;
        return iterator;
      } else {
        iterator.push(object);
      }
    }
    index == 0 ? iterator.push(object) : verifyObjectAlreadyExist(object);
    return iterator;
  }, []);

  return tratedObjects;
};
