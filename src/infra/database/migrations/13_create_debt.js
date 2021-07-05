exports.up = function (knex) {
  return knex.schema.createTable('debt', table => {
    table.increments('id').primary();
    table
      .integer('wallet_id')
      .references('id')
      .inTable('wallet')
      .onDelete('CASCADE');

    table.integer('amount_necessary');
    table.string('dateNow');
    table.string('deadline');
    table.string('from');
    table.string('description');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('debt');
};
