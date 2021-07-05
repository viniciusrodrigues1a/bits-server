exports.seed = function (knex) {
  const description = "My budget's description";
  const name = 'My budget';

  return knex('budget')
    .del()
    .then(() =>
      knex('budget').insert([
        {
          id: 999,
          wallet_id: 999,
          amount_paid: 0,
          amount_total: 1000,
          name,
          description,
        },
        {
          id: 1000,
          wallet_id: 1000,
          amount_paid: 0,
          amount_total: 1000,
          name,
          description,
        },
        {
          id: 1001,
          wallet_id: 999,
          amount_paid: 0,
          amount_total: 1000,
          name,
          description,
        },
        {
          id: 1002,
          wallet_id: 999,
          amount_paid: 0,
          amount_total: 1000,
          name,
          description,
        },
      ])
    );
};
