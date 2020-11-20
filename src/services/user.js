const ValidationError = require('../errors/ValidationError');
const getPasswordHash = require('../utils/getPasswordHash');

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  };

  const find = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
    if (!user.email) throw new ValidationError('E-mail é um atributo obrigatório');
    if (!user.password) throw new ValidationError('Senha é um atributo obrigatório');
    const usersDb = await find({ email: user.email });
    if (usersDb.length > 0) throw new ValidationError('Já existe um usuário com esse e-mail');

    const newUser = { ...user };
    newUser.password = getPasswordHash(user.password);
    return app.db('users').insert(newUser, ['id', 'name', 'email']);
  };

  const update = async (id, user) => {
    if (user.id) throw new ValidationError('Não é permitido alteração de ID');
    if (user.email) throw new ValidationError('Não é permitido alteração de E-mail');
    if (user.name === null || user.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    if (user.password === null || user.password === '') throw new ValidationError('Senha é um atributo obrigatório');
    const usersDb = await find({ id });
    if (usersDb.length === 0) throw new ValidationError('Não é possível alterar usuário inexistente');

    const newUser = { ...user };
    if (user.password) {
      newUser.password = getPasswordHash(user.password);
    }
    return app.db('users').where({ id }).update(newUser, ['id', 'name', 'email']);
  };

  const remove = async (id, userId) => {
    if (id === userId) throw new ValidationError('Você não pode excluir você mesmo!');
    const usersDb = await find({ id });
    if (usersDb.length === 0) throw new ValidationError('Não é possível remover um usuário inexistente');
    const movesDb = await app.services.move.find({ user_id: id });
    if (movesDb.length > 0) throw new ValidationError('Existem movimentações para esse usuário');

    return app.db('users').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
