exports.up = function (knex) {
  return knex.schema.createTable('credit', table => {
    table.increments('id').primary();
    table
      .integer('wallet_id')
      .references('id')
      .inTable('wallet')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('amount');
    table.string('dateNow');
    table.string('deadline');
    table.string('from');
    table.string('description');
  });
};

exports.down = function (knex) {};
