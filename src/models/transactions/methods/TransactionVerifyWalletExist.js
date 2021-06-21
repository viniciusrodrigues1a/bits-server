module.exports = async function (db, wallet_id) {
  const wallet = await db('wallet')
    .where({
      id: wallet_id,
    })
    .select('*')
    .first();

  if (!wallet) {
    throw new Error('wallet not found');
  }
};
