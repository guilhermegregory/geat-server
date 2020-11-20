const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('sectors').select();
  };

  const find = (filter = {}) => {
    return app.db('sectors').where(filter).select();
  };

  const save = async (sector) => {
    if (!sector.name) throw new ValidationError('Nome é um atributo obrigatório');
    const sectorsDb = await find({ name: sector.name });
    if (sectorsDb.length > 0) throw new ValidationError('Já existe um setor com esse nome');

    return app.db('sectors').insert(sector, '*');
  };

  const update = async (id, sector) => {
    if (sector.id) throw new ValidationError('Não é permitido alteração de ID');
    if (sector.name === null || sector.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const sectorsDb = await find({ name: sector.name });
    if (sectorsDb.length > 0) throw new ValidationError('Já existe um setor com esse nome');
    const sectorsDb2 = await find({ id });
    if (sectorsDb2.length === 0) throw new ValidationError('Não é possível alterar setor inexistente');

    return app.db('sectors').where({ id }).update(sector, '*');
  };

  const remove = async (id) => {
    const sectorsDb = await find({ id });
    if (sectorsDb.length === 0) throw new ValidationError('Não é possível remover um setor inexistente');
    const collaboratorsDb = await app.services.collaborator.find({ sector_id: id });
    if (collaboratorsDb.length > 0) throw new ValidationError('Existem colaboradores para esse setor');

    return app.db('sectors').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
