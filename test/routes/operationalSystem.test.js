const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/operationalsystems';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA5MDAsIm5hbWUiOiJVc2VyICMxMSIsImVtYWlsIjoidXNlcjExQGVtYWlsLmNvbSJ9.PtqOY_pf2fEERb7WJOx0Aax9p4b3Kwaxekkp3SE39Fk';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os sistemas operacionais', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar um sistema operacional específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um sistema operacional com sucesso', () => {
  let operationalSystemBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Operational System Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        operationalSystemBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do sistema operacional', () => {
    expect(operationalSystemBodyResponse).toHaveProperty('id');
    expect(operationalSystemBodyResponse).toHaveProperty('name');
    expect(operationalSystemBodyResponse.name).toBe('Operational System Save');
  });
});

describe('Ao tentar salvar um sistema operacional inválido', () => {
  const validOperationalSystem = { name: 'Operational System Invalid' };

  const operationalSystemTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validOperationalSystem, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => operationalSystemTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => operationalSystemTestTemplate({ name: 'Operational System #1' }, 'Já existe um sistema operacional com esse nome'));
});

describe('Ao alterar um sistema operacional com sucesso', () => {
  let operationalSystemBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Operational System #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        operationalSystemBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do sistema operacional', () => {
    expect(operationalSystemBodyResponse).toHaveProperty('id');
    expect(operationalSystemBodyResponse).toHaveProperty('name');
    expect(operationalSystemBodyResponse.name).toBe('Operational System #1 Updated');
  });
});

describe('Ao tentar alterar um sistema operacional inválido', () => {
  const operationalSystemTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de ID', () => operationalSystemTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => operationalSystemTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => operationalSystemTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para nome existente', () => operationalSystemTestTemplate({ name: 'Operational System #1 Updated' }, 'Já existe um sistema operacional com esse nome'));

  test('Não deve alterar sistema operacional inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Operational System Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar sistema operacional inexistente');
      });
  });
});

describe('Ao remover um sistema operacional com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O sistema operacional deve ter sido removido do banco', () => {
    return app.db('operationalsystems').where({ id: 10001 })
      .then((operationalSystems) => {
        expect(operationalSystems).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um sistema operacional inválido', () => {
  test('Não deve remover sistema operacional que já possua hardware', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem hardwares para esse sistema operacional');
      });
  });

  test('Não deve remover sistema operacional inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um sistema operacional inexistente');
      });
  });
});
