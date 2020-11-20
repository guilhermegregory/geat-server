exports.up = (knex) => {
  return knex.schema.createTable('moves', (t) => {
    t.increments('id').primary();
    t.date('date').notNullable();
    t.date('deadline');
    t.integer('hardware_id')
      .references('id')
      .inTable('hardwares')
      .notNullable();
    t.integer('collaborator_id')
      .references('id')
      .inTable('collaborators')
      .notNullable();
    t.integer('user_id')
      .references('id')
      .inTable('users')
      .notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('moves');
};
