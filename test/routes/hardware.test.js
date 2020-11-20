const request = require('supertest');
const { DateTime } = require('luxon');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/hardwares';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMDAsIm5hbWUiOiJVc2VyICMxMyIsImVtYWlsIjoidXNlcjEzQGVtYWlsLmNvbSJ9.n1LbTcIfz_2p8jWXXZsEEaeNrWzbH2b1dPoyl6uYZGM';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os hardwares', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar um hardware específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
});

describe('Ao salvar um hardware com sucesso', () => {
  let hardwareBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ type_id: 10100, aquisition_date: DateTime.local(), model_id: 10100, processor_id: 10100, service_tag: 'Service Tag Save', memory_type_id: 10100, memory_ammount: 'Memory Ammount Save', ip: 'IP Save', machine_name: 'Machine Name Save', operational_system_id: 10100, office_id: 10100, office_key: 'Office Key Save', office_key_date: DateTime.local() })
      .then((res) => {
        expect(res.status).toBe(201);
        hardwareBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, type_id, aquisition_date, model_id, processor_id, service_tag, memory_type_id, memory_ammount, ip, machine_name, operational_system_id, office_id, office_key e office_key_date do hardware', () => {
    expect(hardwareBodyResponse).toHaveProperty('id');
    expect(hardwareBodyResponse).toHaveProperty('type_id');
    expect(hardwareBodyResponse.type_id).toBe(10100);
    expect(hardwareBodyResponse).toHaveProperty('aquisition_date');
    expect(hardwareBodyResponse).toHaveProperty('model_id');
    expect(hardwareBodyResponse.model_id).toBe(10100);
    expect(hardwareBodyResponse).toHaveProperty('processor_id');
    expect(hardwareBodyResponse.processor_id).toBe(10100);
    expect(hardwareBodyResponse).toHaveProperty('service_tag');
    expect(hardwareBodyResponse.service_tag).toBe('Service Tag Save');
    expect(hardwareBodyResponse).toHaveProperty('memory_type_id');
    expect(hardwareBodyResponse.memory_type_id).toBe(10100);
    expect(hardwareBodyResponse).toHaveProperty('memory_ammount');
    expect(hardwareBodyResponse.memory_ammount).toBe('Memory Ammount Save');
    expect(hardwareBodyResponse).toHaveProperty('ip');
    expect(hardwareBodyResponse.ip).toBe('IP Save');
    expect(hardwareBodyResponse).toHaveProperty('machine_name');
    expect(hardwareBodyResponse.machine_name).toBe('Machine Name Save');
    expect(hardwareBodyResponse).toHaveProperty('operational_system_id');
    expect(hardwareBodyResponse.operational_system_id).toBe(10100);
    expect(hardwareBodyResponse).toHaveProperty('office_id');
    expect(hardwareBodyResponse.office_id).toBe(10100);
    expect(hardwareBodyResponse).toHaveProperty('office_key');
    expect(hardwareBodyResponse.office_key).toBe('Office Key Save');
    expect(hardwareBodyResponse).toHaveProperty('office_key_date');
  });
});

describe('Ao tentar salvar um hardware inválido', () => {
  const validHardware = { type_id: 10100, aquisition_date: DateTime.local(), model_id: 10100, processor_id: 10100, service_tag: 'Service Tag Save Invalid', memory_type_id: 10100, memory_ammount: 'Memory Ammount Save Invalid', ip: 'IP Save Invalid', machine_name: 'Machine Name Save Invalid', operational_system_id: 10100, office_id: 10100, office_key: 'Office Key Save Invalid', office_key_date: DateTime.local() };

  const hardwareTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validHardware, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem tipo', () => hardwareTestTemplate({ type_id: null }, 'Tipo é um atributo obrigatório'));
  test('Não deve inserir sem data de aquisição', () => hardwareTestTemplate({ aquisition_date: null }, 'Data de Aquisição é um atributo obrigatório'));
  test('Não deve inserir sem modelo', () => hardwareTestTemplate({ model_id: null }, 'Modelo é um atributo obrigatório'));
  test('Não deve inserir com service tag existente', () => hardwareTestTemplate({ service_tag: 'Service Tag #1' }, 'Já existe um hardware com essa service tag'));
  test('Não deve inserir com ip existente', () => hardwareTestTemplate({ ip: 'IP #1' }, 'Já existe um hardware com esse ip'));
  test('Não deve inserir com nome de máquina existente', () => hardwareTestTemplate({ machine_name: 'Machine Name #1' }, 'Já existe um hardware com esse nome de máquina'));
  test('Não deve inserir com chave do office existente', () => hardwareTestTemplate({ office_key: 'Office Key #1' }, 'Já existe um hardware com essa chave de office'));
  test('Não deve inserir com tipo inexistente', () => hardwareTestTemplate({ type_id: 10102 }, 'Este tipo não está cadastrado'));
  test('Não deve inserir com modelo inexistente', () => hardwareTestTemplate({ model_id: 10102 }, 'Este modelo não está cadastrado'));
  test('Não deve inserir com processador inexistente', () => hardwareTestTemplate({ processor_id: 10102 }, 'Este processador não está cadastrado'));
  test('Não deve inserir com tipo de memória inexistente', () => hardwareTestTemplate({ memory_type_id: 10102 }, 'Este tipo de memória não está cadastrado'));
  test('Não deve inserir com sistema operacional inexistente', () => hardwareTestTemplate({ operational_system_id: 10102 }, 'Este sistema operacional não está cadastrado'));
  test('Não deve inserir com office inexistente', () => hardwareTestTemplate({ office_id: 10102 }, 'Este office não está cadastrado'));
});

describe('Ao alterar um hardware com sucesso', () => {
  let hardwareBodyResponse;

  const hardwareTestTemplate = (updatedData, last = false) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(200);
        if (last) {
          hardwareBodyResponse = res.body;
        }
      });
  };

  test('Deve permitir alteração de tipo', () => hardwareTestTemplate({ type_id: 10101 }));
  test('Deve permitir alteração de data de aquisição', () => hardwareTestTemplate({ aquisition_date: DateTime.local().plus({ days: 1 }) }));
  test('Deve permitir alteração de modelo', () => hardwareTestTemplate({ model_id: 10101 }));
  test('Deve permitir alteração de processador', () => hardwareTestTemplate({ processor_id: 10101 }));
  test('Deve permitir alteração de service tag', () => hardwareTestTemplate({ service_tag: 'Service Tag #1 Updated' }));
  test('Deve permitir alteração de tipo de memória', () => hardwareTestTemplate({ memory_type_id: 10101 }));
  test('Deve permitir alteração de quantidade de memória', () => hardwareTestTemplate({ memory_ammount: 'Memory Ammount #1 Updated' }));
  test('Deve permitir alteração de ip', () => hardwareTestTemplate({ ip: 'IP #1 Updated' }));
  test('Deve permitir alteração de nome de máquina', () => hardwareTestTemplate({ machine_name: 'Machine Name #1 Updated' }));
  test('Deve permitir alteração de sistema operacional', () => hardwareTestTemplate({ operational_system_id: 10101 }));
  test('Deve permitir alteração de office', () => hardwareTestTemplate({ office_id: 10101 }));
  test('Deve permitir alteração de chave do office', () => hardwareTestTemplate({ office_key: 'Office Key #1 Updated' }));
  test('Deve permitir alteração de data da chave do office', () => hardwareTestTemplate({ office_key_date: DateTime.local().plus({ days: 1 }) }, true));

  test('Deve retornar o id, type_id, aquisition_date, model_id, processor_id, service_tag, memory_type_id, memory_ammount, ip, machine_name, operational_system_id, office_id, office_key e office_key_date do hardware', () => {
    expect(hardwareBodyResponse).toHaveProperty('id');
    expect(hardwareBodyResponse).toHaveProperty('type_id');
    expect(hardwareBodyResponse.type_id).toBe(10101);
    expect(hardwareBodyResponse).toHaveProperty('aquisition_date');
    expect(hardwareBodyResponse).toHaveProperty('model_id');
    expect(hardwareBodyResponse.model_id).toBe(10101);
    expect(hardwareBodyResponse).toHaveProperty('processor_id');
    expect(hardwareBodyResponse.processor_id).toBe(10101);
    expect(hardwareBodyResponse).toHaveProperty('service_tag');
    expect(hardwareBodyResponse.service_tag).toBe('Service Tag #1 Updated');
    expect(hardwareBodyResponse).toHaveProperty('memory_type_id');
    expect(hardwareBodyResponse.memory_type_id).toBe(10101);
    expect(hardwareBodyResponse).toHaveProperty('memory_ammount');
    expect(hardwareBodyResponse.memory_ammount).toBe('Memory Ammount #1 Updated');
    expect(hardwareBodyResponse).toHaveProperty('ip');
    expect(hardwareBodyResponse.ip).toBe('IP #1 Updated');
    expect(hardwareBodyResponse).toHaveProperty('machine_name');
    expect(hardwareBodyResponse.machine_name).toBe('Machine Name #1 Updated');
    expect(hardwareBodyResponse).toHaveProperty('operational_system_id');
    expect(hardwareBodyResponse.operational_system_id).toBe(10101);
    expect(hardwareBodyResponse).toHaveProperty('office_id');
    expect(hardwareBodyResponse.office_id).toBe(10101);
    expect(hardwareBodyResponse).toHaveProperty('office_key');
    expect(hardwareBodyResponse.office_key).toBe('Office Key #1 Updated');
    expect(hardwareBodyResponse).toHaveProperty('office_key_date');
  });
});

describe('Ao tentar alterar um hardware inválido', () => {
  const hardwareTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de id', () => hardwareTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de data de aquisição para nulo', () => hardwareTestTemplate({ aquisition_date: null }, 'Data de Aquisição é um atributo obrigatório'));
  test('Não deve permitir alteração de data de aquisição para vazio', () => hardwareTestTemplate({ aquisition_date: '' }, 'Data de Aquisição é um atributo obrigatório'));
  test('Não deve permitir alteração de modelo para nulo', () => hardwareTestTemplate({ model_id: null }, 'Modelo é um atributo obrigatório'));
  test('Não deve permitir alteração de modelo para vazio', () => hardwareTestTemplate({ model_id: '' }, 'Modelo é um atributo obrigatório'));
  test('Não deve permitir alteração de tipo para inexistente', () => hardwareTestTemplate({ type_id: 10102 }, 'Este tipo não está cadastrado'));
  test('Não deve permitir alteração de modelo para inexistente', () => hardwareTestTemplate({ model_id: 10102 }, 'Este modelo não está cadastrado'));
  test('Não deve permitir alteração de processador para inexistente', () => hardwareTestTemplate({ processor_id: 10102 }, 'Este processador não está cadastrado'));
  test('Não deve permitir alteração de tipo de memória para inexistente', () => hardwareTestTemplate({ memory_type_id: 10102 }, 'Este tipo de memória não está cadastrado'));
  test('Não deve permitir alteração de sistema operacional para inexistente', () => hardwareTestTemplate({ operational_system_id: 10102 }, 'Este sistema operacional não está cadastrado'));
  test('Não deve permitir alteração de office para inexistente', () => hardwareTestTemplate({ office_id: 10102 }, 'Este office não está cadastrado'));
  test('Não deve permitir alteração de service tag para existente', () => hardwareTestTemplate({ service_tag: 'Service Tag #2' }, 'Já existe um hardware com essa service tag'));
  test('Não deve permitir alteração de ip para existente', () => hardwareTestTemplate({ ip: 'IP #2' }, 'Já existe um hardware com esse ip'));
  test('Não deve permitir alteração de nome de máquina para existente', () => hardwareTestTemplate({ machine_name: 'Machine Name #2' }, 'Já existe um hardware com esse nome de máquina'));
  test('Não deve permitir alteração de chave de office para existente', () => hardwareTestTemplate({ office_key: 'Office Key #2' }, 'Já existe um hardware com essa chave de office'));

  test('Não deve permitir alteração de hardware inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ model_id: 10101 })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar hardware inexistente');
      });
  });
});

describe('Ao remover um hardware com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O hardware deve ter sido removido do banco', () => {
    return app.db('hardwares').where({ id: 10001 }).select()
      .then((hardwares) => {
        expect(hardwares.length).toBe(0);
      });
  });
});

describe('Ao tentar remover um hardware inválido', () => {
  test('Não deve remover hardware que já possua movimentação', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem movimentações para esse hardware');
      });
  });

  test('Não deve remover hardware inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um hardware inexistente');
      });
  });
});
