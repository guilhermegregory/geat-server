const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('offices').select();
  };

  const find = (filter = {}) => {
    return app.db('offices').where(filter).select();
  };

  const save = async (office) => {
    if (!office.name) throw new ValidationError('Nome é um atributo obrigatório');
    const officesDb = await find({ name: office.name });
    if (officesDb.length > 0) throw new ValidationError('Já existe um office com esse nome');

    return app.db('offices').insert(office, '*');
  };

  const update = async (id, office) => {
    if (office.id) throw new ValidationError('Não é permitido alteração de ID');
    if (office.name === null || office.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const officesDb = await find({ name: office.name });
    if (officesDb.length > 0) throw new ValidationError('Já existe um office com esse nome');
    const officesDb2 = await find({ id });
    if (officesDb2.length === 0) throw new ValidationError('Não é possível alterar office inexistente');

    return app.db('offices').where({ id }).update(office, '*');
  };

  const remove = async (id) => {
    const officesDb = await find({ id });
    if (officesDb.length === 0) throw new ValidationError('Não é possível remover um office inexistente');
    const hardwaresDb = await app.services.hardware.find({ office_id: id });
    if (hardwaresDb.length > 0) throw new ValidationError('Existem hardwares para esse office');

    return app.db('offices').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
