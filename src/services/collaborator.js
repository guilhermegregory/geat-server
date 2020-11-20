const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('collaborators').select();
  };

  const find = (filter = {}) => {
    return app.db('collaborators').where(filter).select();
  };

  const save = async (collaborator) => {
    if (!collaborator.name) throw new ValidationError('Nome é um atributo obrigatório');
    if (!collaborator.email) throw new ValidationError('E-mail é um atributo obrigatório');
    if (!collaborator.sector_id) throw new ValidationError('Setor é um atributo obrigatório');
    const collaboratorsDb = await find({ email: collaborator.email });
    if (collaboratorsDb.length > 0) throw new ValidationError('Já existe um colaborador com esse e-mail');
    const sectorsDb = await app.services.sector.find({ id: collaborator.sector_id });
    if (sectorsDb.length === 0) throw new ValidationError('Este setor nao está cadastrado');

    return app.db('collaborators').insert(collaborator, '*');
  };

  const update = async (id, collaborator) => {
    if (collaborator.id) throw new ValidationError('Não é permitido alteração de ID');
    if (collaborator.email) throw new ValidationError('Não é permitido alteração de E-mail');
    if (collaborator.name === null || collaborator.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    if (collaborator.sector_id === null || collaborator.sector_id === '') throw new ValidationError('Setor é um atributo obrigatório');
    if (collaborator.sector_id) {
      sectorsDb = await app.services.sector.find({ id: collaborator.sector_id });
      if (sectorsDb.length === 0) throw new ValidationError('Este setor nao está cadastrado');
    }
    const collaboratorsDb = await find({ id });
    if (collaboratorsDb.length === 0) throw new ValidationError('Não é possível alterar colaborador inexistente');

    return app.db('collaborators').where({ id }).update(collaborator, '*');
  };

  const remove = async (id) => {
    const collaboratorsDb = await find({ id });
    if (collaboratorsDb.length === 0) throw new ValidationError('Não é possível remover um colaborador inexistente');
    const movesDb = await app.services.move.find({ collaborator_id: id });
    if (movesDb.length > 0) throw new ValidationError('Existem movimentações para esse colaborador');

    return app.db('collaborators').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
