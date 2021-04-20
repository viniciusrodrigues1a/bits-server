exports.up = function (knex) {
  return knex.schema.createTable('scheduled_transaction_execution', table => {
    table.increments('id').primary();
    table
      .integer('scheduled_transaction_id')
      .references('id')
      .inTable('scheduled_transaction');
    table.string('execution_status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('scheduled_transaction_execution');
};
