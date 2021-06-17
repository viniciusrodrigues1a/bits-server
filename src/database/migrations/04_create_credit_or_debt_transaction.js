exports.up = function (knex) {
  return knex.schema.createTable('create_credit_or_debt_transaction', table => {
    table.increments('id').primary();
    table.integer('debt_or_credit_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('create_credit_or_debt_transaction');
};
