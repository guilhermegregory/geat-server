exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10300, name: 'User #5', email: 'user5@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('sectors').insert([
      { id: 10100, name: 'Sector #3' },
      { id: 10101, name: 'Sector #4' },
    ]))
    .then(() => knex('collaborators').insert([
      { id: 10000, name: 'Collaborator #1', email: 'collaborator1@email.com', sector_id: 10100 },
      { id: 10001, name: 'Collaborator #2', email: 'collaborator2@email.com', sector_id: 10100 },
    ]));
};
