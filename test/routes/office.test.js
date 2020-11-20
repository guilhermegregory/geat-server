const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/offices';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEwMDAsIm5hbWUiOiJVc2VyICMxMiIsImVtYWlsIjoidXNlcjEyQGVtYWlsLmNvbSJ9.Q2Kw_PSI40q_DX8Gcp6SoXm0djBm_yY_8GE1nFENxy4';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os offices', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar um office específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um office com sucesso', () => {
  let officeBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Office Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        officeBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do office', () => {
    expect(officeBodyResponse).toHaveProperty('id');
    expect(officeBodyResponse).toHaveProperty('name');
    expect(officeBodyResponse.name).toBe('Office Save');
  });
});

describe('Ao tentar salvar um office inválido', () => {
  const validOffice = { name: 'Office Invalid' };

  const officeTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validOffice, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => officeTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => officeTestTemplate({ name: 'Office #1' }, 'Já existe um office com esse nome'));
});

describe('Ao alterar um office com sucesso', () => {
  let officeBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Office #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        officeBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do office', () => {
    expect(officeBodyResponse).toHaveProperty('id');
    expect(officeBodyResponse).toHaveProperty('name');
    expect(officeBodyResponse.name).toBe('Office #1 Updated');
  });
});

describe('Ao tentar alterar um office inválido', () => {
  const officeTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de ID', () => officeTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => officeTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => officeTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para nome existente', () => officeTestTemplate({ name: 'Office #1 Updated' }, 'Já existe um office com esse nome'));

  test('Não deve alterar office inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Office Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar office inexistente');
      });
  });
});

describe('Ao remover um office com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O office deve ter sido removido do banco', () => {
    return app.db('offices').where({ id: 10001 })
      .then((offices) => {
        expect(offices).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um office inválido', () => {
  test('Não deve remover office que já possua hardware', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem hardwares para esse office');
      });
  });

  test('Não deve remover office inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um office inexistente');
      });
  });
});
