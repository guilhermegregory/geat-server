exports.up = (knex) => {
  return knex.schema.createTable('models', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.integer('brand_id')
      .references('id')
      .inTable('brands')
      .notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('models');
};
