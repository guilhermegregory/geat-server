const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('hardwares').select();
  };

  const find = (filter) => {
    return app.db('hardwares').where(filter).select();
  };

  const save = async (hardware) => {
    if (!hardware.type_id) throw new ValidationError('Tipo é um atributo obrigatório');
    if (!hardware.aquisition_date) throw new ValidationError('Data de Aquisição é um atributo obrigatório');
    if (!hardware.model_id) throw new ValidationError('Modelo é um atributo obrigatório');
    const hardwaresDb = await find({ service_tag: hardware.service_tag });
    if (hardwaresDb.length > 0) throw new ValidationError('Já existe um hardware com essa service tag');
    const hardwaresDb2 = await find({ ip: hardware.ip });
    if (hardwaresDb2.length > 0) throw new ValidationError('Já existe um hardware com esse ip');
    const hardwaresDb3 = await find({ machine_name: hardware.machine_name });
    if (hardwaresDb3.length > 0) throw new ValidationError('Já existe um hardware com esse nome de máquina');
    const hardwaresDb4 = await find({ office_key: hardware.office_key });
    if (hardwaresDb4.length > 0) throw new ValidationError('Já existe um hardware com essa chave de office');
    if (hardware.type_id) {
      const typesDb = await app.services.type.find({ id: hardware.type_id });
      if (typesDb.length === 0) throw new ValidationError('Este tipo não está cadastrado');
    }
    if (hardware.model_id) {
      const modelsDb = await app.services.model.find({ id: hardware.model_id });
      if (modelsDb.length === 0) throw new ValidationError('Este modelo não está cadastrado');
    }
    if (hardware.processor_id) {
      const processorsDb = await app.services.processor.find({ id: hardware.processor_id });
      if (processorsDb.length === 0) throw new ValidationError('Este processador não está cadastrado');
    }
    if (hardware.memory_type_id) {
      const memoryTypesDb = await app.services.memoryType.find({ id: hardware.memory_type_id });
      if (memoryTypesDb.length === 0) throw new ValidationError('Este tipo de memória não está cadastrado');
    }
    if (hardware.operational_system_id) {
      const operationalSystemsDb = await app.services.operationalSystem.find({ id: hardware.operational_system_id });
      if (operationalSystemsDb.length === 0) throw new ValidationError('Este sistema operacional não está cadastrado');
    }
    if (hardware.office_id) {
      const officesDb = await app.services.office.find({ id: hardware.office_id });
      if (officesDb.length === 0) throw new ValidationError('Este office não está cadastrado');
    }

    return app.db('hardwares').insert(hardware, '*');
  };

  const update = async (id, hardware) => {
    if (hardware.id) throw new ValidationError('Não é permitido alteração de ID');
    if (hardware.control_number) throw new ValidationError('Não é permitido alteração de número de controle');
    if (hardware.aquisition_date === null || hardware.aquisition_date === '') throw new ValidationError('Data de Aquisição é um atributo obrigatório');
    if (hardware.model_id === null || hardware.model_id === '') throw new ValidationError('Modelo é um atributo obrigatório');
    if (hardware.type_id) {
      const typesDb = await app.services.type.find({ id: hardware.type_id });
      if (typesDb.length === 0) throw new ValidationError('Este tipo não está cadastrado');
    }
    if (hardware.model_id) {
      const modelsDb = await app.services.model.find({ id: hardware.model_id });
      if (modelsDb.length === 0) throw new ValidationError('Este modelo não está cadastrado');
    }
    if (hardware.processor_id) {
      const processorsDb = await app.services.processor.find({ id: hardware.processor_id });
      if (processorsDb.length === 0) throw new ValidationError('Este processador não está cadastrado');
    }
    if (hardware.memory_type_id) {
      const memoryTypesDb = await app.services.memoryType.find({ id: hardware.memory_type_id });
      if (memoryTypesDb.length === 0) throw new ValidationError('Este tipo de memória não está cadastrado');
    }
    if (hardware.operational_system_id) {
      const operationalSystemsDb = await app.services.operationalSystem.find({ id: hardware.operational_system_id });
      if (operationalSystemsDb.length === 0) throw new ValidationError('Este sistema operacional não está cadastrado');
    }
    if (hardware.office_id) {
      const officesDb = await app.services.office.find({ id: hardware.office_id });
      if (officesDb.length === 0) throw new ValidationError('Este office não está cadastrado');
    }
    if (hardware.service_tag) {
      const hardwaresDb = await find({ service_tag: hardware.service_tag });
      if (hardwaresDb.length > 0) throw new ValidationError('Já existe um hardware com essa service tag');
    }
    if (hardware.ip) {
      const hardwaresDb2 = await find({ ip: hardware.ip });
      if (hardwaresDb2.length > 0) throw new ValidationError('Já existe um hardware com esse ip');
    }
    if (hardware.machine_name) {
      const hardwaresDb3 = await find({ machine_name: hardware.machine_name });
      if (hardwaresDb3.length > 0) throw new ValidationError('Já existe um hardware com esse nome de máquina');
    }
    if (hardware.office_key) {
      const hardwaresDb4 = await find({ office_key: hardware.office_key });
      if (hardwaresDb4.length > 0) throw new ValidationError('Já existe um hardware com essa chave de office');
    }
    const hardwaresDb5 = await find({ id });
    if (hardwaresDb5.length === 0) throw new ValidationError('Não é possível alterar hardware inexistente');

    return app.db('hardwares').where({ id }).update(hardware, '*');
  };

  const remove = async (id) => {
    const hardwaresDb = await find({ id });
    if (hardwaresDb.length === 0) throw new ValidationError('Não é possível remover um hardware inexistente');
    const movesDb = await app.services.move.find({ hardware_id: id });
    if (movesDb.length > 0) throw new ValidationError('Existem movimentações para esse hardware');

    return app.db('hardwares').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
