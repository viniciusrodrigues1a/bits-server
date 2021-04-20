exports.up = function (knex) {
  return knex.schema.createTable('scheduled_transaction_category', table => {
    table.increments('id').primary();
    table
      .integer('scheduled_transaction_id')
      .references('id')
      .inTable('scheduled_transaction');
    table.integer('category_id').references('id').inTable('category');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('scheduled_transaction_category');
};
