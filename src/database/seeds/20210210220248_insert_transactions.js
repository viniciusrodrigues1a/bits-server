exports.seed = function (knex) {
  const amount = 30;
  const description = 'My transaction';

  return knex('transaction')
    .del()
    .then(() =>
      knex('transaction').insert([
        {
          id: 999,
          amount, //30
          description,
          category_id: 999,
          wallet_id: 999,
        },
        {
          id: 1000,
          amount: -15, // -15
          description,
          wallet_id: 1000,
          category_id: 1000,
        },
        {
          id: 1001,
          amount, // 60
          description,
          wallet_id: 999,
          category_id: 999,
        },
        {
          id: 1002,
          amount: -15, // 30
          description,
          wallet_id: 1001,
          category_id: 1000,
        },
      ])
    );
};
