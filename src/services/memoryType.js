const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('memorytypes').select();
  };

  const find = (filter = {}) => {
    return app.db('memorytypes').where(filter).select();
  };

  const save = async (memoryType) => {
    if (!memoryType.name) throw new ValidationError('Nome é um atributo obrigatório');
    const memoryTypesDb = await find({ name: memoryType.name });
    if (memoryTypesDb.length > 0) throw new ValidationError('Já existe um tipo de memória com esse nome');

    return app.db('memorytypes').insert(memoryType, '*');
  };

  const update = async (id, memoryType) => {
    if (memoryType.id) throw new ValidationError('Não é permitido alteração de ID');
    if (memoryType.name === null || memoryType.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const memoryTypesDb = await find({ name: memoryType.name });
    if (memoryTypesDb.length > 0) throw new ValidationError('Já existe um tipo de memória com esse nome');
    const memoryTypesDb2 = await find({ id });
    if (memoryTypesDb2.length === 0) throw new ValidationError('Não é possível alterar tipo de memória inexistente');

    return app.db('memorytypes').where({ id }).update(memoryType, '*');
  };

  const remove = async (id) => {
    const memoryTypesDb = await find({ id });
    if (memoryTypesDb.length === 0) throw new ValidationError('Não é possível remover um tipo de memória inexistente');
    const hardwaresDb = await app.services.hardware.find({ memory_type_id: id });
    if (hardwaresDb.length > 0) throw new ValidationError('Existem hardwares para esse tipo de memória');

    return app.db('memorytypes').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
