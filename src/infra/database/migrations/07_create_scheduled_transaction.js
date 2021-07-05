exports.up = function (knex) {
  return knex.schema.createTable('scheduled_transaction', table => {
    table.increments('id').primary();
    table
      .integer('wallet_id')
      .references('id')
      .inTable('wallet')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('cron_expression');
    table.integer('amount');
    table.string('description');
    table.timestamp('due_date');
    table.integer('time_span');
    table.string('type');
    table.integer('times_to_repeat');
    table.integer('times_repeated').defaultTo(0);
    table.timestamp('last_transaction_date').defaultTo(null);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('scheduled_transaction');
};
