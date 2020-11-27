exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10100, name: 'User #3', avatar: 'Avatar #3', email: 'user3@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ]);
};
