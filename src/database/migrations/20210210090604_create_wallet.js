exports.up = function (knex) {
  return knex.schema.createTable('wallet', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('currency');
    table.float('exchange_rate');
    table.string('name');
    table.string('description');
    table.integer('balance');
  });
};
exports.down = function (knex) {
  return knex.schema.dropTable('wallet');
};
