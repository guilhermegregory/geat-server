exports.up = (knex) => {
  return knex.schema.createTable('hardwares', (t) => {
    t.increments('id').primary();
    t.date('aquisition_date').notNullable();
    t.string('service_tag').unique();
    t.string('memory_ammount');
    t.string('ip').unique();
    t.string('machine_name').unique();
    t.string('office_key').unique();
    t.date('office_key_date');
    t.integer('type_id')
      .references('id')
      .inTable('types')
      .notNullable();
    t.integer('model_id')
      .references('id')
      .inTable('models')
      .notNullable();
    t.integer('processor_id')
      .references('id')
      .inTable('processors');
    t.integer('memory_type_id')
      .references('id')
      .inTable('memorytypes');
    t.integer('operational_system_id')
      .references('id')
      .inTable('operationalsystems');
    t.integer('office_id')
      .references('id')
      .inTable('offices');
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('hardwares');
};
