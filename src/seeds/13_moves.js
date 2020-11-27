const { DateTime } = require('luxon');

exports.seed = (knex) => {
  return knex('users').insert([
    { id: 11200, name: 'User #14', avatar: 'Avatar #14', email: 'user14@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
    { id: 11201, name: 'User #15', avatar: 'Avatar #15', email: 'user15@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('sectors').insert([
      { id: 10200, name: 'Sector #5' },
    ]))
    .then(() => knex('collaborators').insert([
      { id: 10100, name: 'Collaborator #3', email: 'collaborator3@email.com', sector_id: 10200 },
      { id: 10101, name: 'Collaborator #4', email: 'collaborator4@email.com', sector_id: 10200 },
    ]))
    .then(() => knex('types').insert([
      { id: 10200, name: 'Type #5' },
    ]))
    .then(() => knex('brands').insert([
      { id: 10300, name: 'Brand #6' },
    ]))
    .then(() => knex('models').insert([
      { id: 10200, name: 'Model #5', brand_id: 10300 },
    ]))
    .then(() => knex('processors').insert([
      { id: 10200, name: 'Processor #5' },
    ]))
    .then(() => knex('memorytypes').insert([
      { id: 10200, name: 'Memory Type #5' },
    ]))
    .then(() => knex('operationalsystems').insert([
      { id: 10200, name: 'Operational System #5' },
    ]))
    .then(() => knex('offices').insert([
      { id: 10200, name: 'Office #5' },
    ]))
    .then(() => knex('hardwares').insert([
      { id: 10100, type_id: 10200, aquisition_date: DateTime.local(), model_id: 10200, processor_id: 10200, service_tag: 'Service Tag #3', memory_type_id: 10200, memory_ammount: 'Memory Ammount #3', ip: 'IP #3', machine_name: 'Machine Name #3', operational_system_id: 10200, office_id: 10200, office_key: 'Office Key #3', office_key_date: DateTime.local() },
      { id: 10101, type_id: 10200, aquisition_date: DateTime.local(), model_id: 10200, processor_id: 10200, service_tag: 'Service Tag #4', memory_type_id: 10200, memory_ammount: 'Memory Ammount #4', ip: 'IP #4', machine_name: 'Machine Name #4', operational_system_id: 10200, office_id: 10200, office_key: 'Office Key #4', office_key_date: DateTime.local() },
    ]))
    .then(() => knex('moves').insert([
      { id: 10000, hardware_id: 10100, collaborator_id: 10100, date: DateTime.local(), user_id: 11200, deadline: DateTime.local().plus({ days: 2 }) },
      { id: 10001, hardware_id: 10100, collaborator_id: 10100, date: DateTime.local(), user_id: 11200, deadline: DateTime.local().plus({ days: 2 }) },
      { id: 10002, hardware_id: 10101, collaborator_id: 10101, date: DateTime.local(), user_id: 11200, deadline: DateTime.local().plus({ days: 2 }) },
    ]));
};
