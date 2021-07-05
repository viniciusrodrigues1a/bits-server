exports.seed = function (knex) {
  const name = 'Wallet';
  const balance = 400;
  const currency = 'BRL';

  return knex('wallet')
    .del()
    .then(() =>
      knex('wallet').insert([
        { id: 999, balance, name: 'My wallet', currency, user_id: 999 },
        { id: 1000, balance, name, currency, user_id: 1000 },
        { id: 1001, balance, name, currency, user_id: 999 },
        { id: 1002, balance, name, currency, user_id: 1000 },
      ])
    );
};
