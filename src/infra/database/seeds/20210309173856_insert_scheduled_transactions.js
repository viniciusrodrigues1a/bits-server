exports.seed = function (knex) {
  return knex('scheduled_transaction')
    .del()
    .then(() =>
      knex('scheduled_transaction').insert([
        {
          id: 999,
          wallet_id: 999,
          amount: 100,
          times_to_repeat: 5,
          time_span: 3,
          type: 'minute',
          cron_expression: '*/3 * * * *',
        },
        {
          id: 1000,
          wallet_id: 1000,
          amount: 100,
          times_to_repeat: 6,
          time_span: 2,
          type: 'minute',
          cron_expression: '*/2 * * * *',
        },
        {
          id: 1001,
          wallet_id: 1001,
          amount: 300,
          times_to_repeat: 5,
          time_span: 3,
          type: 'day',
          cron_expression: '00 17 */3 * *',
        },
        {
          id: 1002,
          wallet_id: 1001,
          amount: 300,
          times_to_repeat: 5,
          time_span: 3,
          type: 'month',
          cron_expression: '00 17 * */3 *',
        },
      ])
    );
};
