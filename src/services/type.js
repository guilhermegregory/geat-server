const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('types').select();
  };

  const find = (filter = {}) => {
    return app.db('types').where(filter).select();
  };

  const save = async (type) => {
    if (!type.name) throw new ValidationError('Nome é um atributo obrigatório');
    const typesDb = await find({ name: type.name });
    if (typesDb.length > 0) throw new ValidationError('Já existe um tipo com esse nome');

    return app.db('types').insert(type, '*');
  };

  const update = async (id, type) => {
    if (type.id) throw new ValidationError('Não é permitido alteração de ID');
    if (type.name === null || type.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const typesDb = await find({ name: type.name });
    if (typesDb.length > 0) throw new ValidationError('Já existe um tipo com esse nome');
    const typesDb2 = await find({ id });
    if (typesDb2.length === 0) throw new ValidationError('Não é possível alterar tipo inexistente');

    return app.db('types').where({ id }).update(type, '*');
  };

  const remove = async (id) => {
    const typesDb = await find({ id });
    if (typesDb.length === 0) throw new ValidationError('Não é possível remover um tipo inexistente');
    const hardwaresDb = await app.services.hardware.find({ type_id: id });
    if (hardwaresDb.length > 0) throw new ValidationError('Existem hardwares para esse tipo');

    return app.db('types').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
