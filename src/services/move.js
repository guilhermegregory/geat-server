const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('moves').where(filter).select();
  };

  const find = (filter = {}) => {
    return app.db('moves').where(filter).select();
  };

  const save = async (move) => {
    if (!move.hardware_id) throw new ValidationError('Hardware é um atributo obrigatório');
    if (!move.collaborator_id) throw new ValidationError('Colaborador é um atributo obrigatório');
    if (!move.date) throw new ValidationError('Data é um atributo obrigatório');
    if (!move.user_id) throw new ValidationError('Usuário é um atributo obrigatório');
    const hardwaresDb = await app.services.hardware.find({ id: move.hardware_id });
    if (hardwaresDb.length === 0) throw new ValidationError('Este hardware nao está cadastrado');
    const collaboratorsDb = await app.services.collaborator.find({ id: move.collaborator_id });
    if (collaboratorsDb.length === 0) throw new ValidationError('Este colaborador nao está cadastrado');
    const usersDb = await app.services.user.find({ id: move.user_id });
    if (usersDb.length === 0) throw new ValidationError('Este usuário nao está cadastrado');

    return app.db('moves').insert(move, '*');
  };

  const remove = (id) => {
    return app.db('moves').where({ id }).del();
  };

  return { findAll, find, save, remove };
};
