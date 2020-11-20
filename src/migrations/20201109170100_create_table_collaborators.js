exports.up = (knex) => {
  return knex.schema.createTable('collaborators', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.integer('sector_id')
      .references('id')
      .inTable('sectors')
      .notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('collaborators');
};
