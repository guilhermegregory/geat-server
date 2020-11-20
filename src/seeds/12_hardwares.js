const { DateTime } = require('luxon');

exports.seed = (knex) => {
  return knex('users').insert([
    { id: 11100, name: 'User #13', email: 'user13@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('types').insert([
      { id: 10100, name: 'Type #3' },
      { id: 10101, name: 'Type #4' },
    ]))
    .then(() => knex('brands').insert([
      { id: 10200, name: 'Brand #5' },
    ]))
    .then(() => knex('models').insert([
      { id: 10100, name: 'Model #3', brand_id: 10200 },
      { id: 10101, name: 'Model #4', brand_id: 10200 },
    ]))
    .then(() => knex('processors').insert([
      { id: 10100, name: 'Processor #3' },
      { id: 10101, name: 'Processor #4' },
    ]))
    .then(() => knex('memorytypes').insert([
      { id: 10100, name: 'Memory Type #3' },
      { id: 10101, name: 'Memory Type #4' },
    ]))
    .then(() => knex('operationalsystems').insert([
      { id: 10100, name: 'Operational System #3' },
      { id: 10101, name: 'Operational System #4' },
    ]))
    .then(() => knex('offices').insert([
      { id: 10100, name: 'Office #3' },
      { id: 10101, name: 'Office #4' },
    ]))
    .then(() => knex('hardwares').insert([
      { id: 10000, type_id: 10100, aquisition_date: DateTime.local(), model_id: 10100, processor_id: 10100, service_tag: 'Service Tag #1', memory_type_id: 10100, memory_ammount: 'Memory Ammount #1', ip: 'IP #1', machine_name: 'Machine Name #1', operational_system_id: 10100, office_id: 10100, office_key: 'Office Key #1', office_key_date: DateTime.local() },
      { id: 10001, type_id: 10100, aquisition_date: DateTime.local(), model_id: 10100, processor_id: 10100, service_tag: 'Service Tag #2', memory_type_id: 10100, memory_ammount: 'Memory Ammount #2', ip: 'IP #2', machine_name: 'Machine Name #2', operational_system_id: 10100, office_id: 10100, office_key: 'Office Key #2', office_key_date: DateTime.local() },
    ]));
};
