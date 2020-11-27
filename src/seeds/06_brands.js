exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10500, name: 'User #7', avatar: 'Avatar #7', email: 'user7@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('brands').insert([
      { id: 10000, name: 'Brand #1' },
      { id: 10001, name: 'Brand #2' },
    ]));
};
