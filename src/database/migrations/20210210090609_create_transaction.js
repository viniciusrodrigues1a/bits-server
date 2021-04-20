exports.up = function (knex) {
  return knex.schema.createTable('transaction', table => {
    table.increments('id').primary();
    table
      .integer('wallet_id')
      .references('id')
      .inTable('wallet')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('category_id').references('id').inTable('category');
    table.integer('amount');
    table.boolean('incoming');
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = function (knex) {
  return knex.schema.dropTable('transaction');
};
