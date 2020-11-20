exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10900, name: 'User #11', email: 'user11@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('operationalsystems').insert([
      { id: 10000, name: 'Operational System #1' },
      { id: 10001, name: 'Operational System #2' },
    ]));
};
