module.exports = async function GetCredit(db, table, creditOrDebtId) {
  const creditOrDebt = await db(table)
    .where({ id: creditOrDebtId })
    .select('*')
    .first();
  if (!creditOrDebt) throw new Error('credit not found');
  return creditOrDebt;
};
