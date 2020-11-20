const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/types';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA0MDAsIm5hbWUiOiJVc2VyICM2IiwiZW1haWwiOiJ1c2VyNkBlbWFpbC5jb20ifQ.V69hBv9DZ1Uy46qzYgtniGN6G0xzSeHj2dgymiF6_kI';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os tipos', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar um tipo específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um tipo com sucesso', () => {
  let typeBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Type Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        typeBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do tipo', () => {
    expect(typeBodyResponse).toHaveProperty('id');
    expect(typeBodyResponse).toHaveProperty('name');
    expect(typeBodyResponse.name).toBe('Type Save');
  });
});

describe('Ao tentar salvar um tipo inválido', () => {
  const validType = { name: 'Type Invalid' };

  const typeTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validType, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => typeTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => typeTestTemplate({ name: 'Type #1' }, 'Já existe um tipo com esse nome'));
});

describe('Ao alterar um tipo com sucesso', () => {
  let typeBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Type #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        typeBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do tipo', () => {
    expect(typeBodyResponse).toHaveProperty('id');
    expect(typeBodyResponse).toHaveProperty('name');
    expect(typeBodyResponse.name).toBe('Type #1 Updated');
  });
});

describe('Ao tentar alterar um tipo inválido', () => {
  const typeTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de ID', () => typeTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => typeTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => typeTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para nome existente', () => typeTestTemplate({ name: 'Type #1 Updated' }, 'Já existe um tipo com esse nome'));

  test('Não deve alterar tipo inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Type Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar tipo inexistente');
      });
  });
});

describe('Ao remover um tipo com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O tipo deve ter sido removido do banco', () => {
    return app.db('types').where({ id: 10001 })
      .then((types) => {
        expect(types).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um tipo inválido', () => {
  test('Não deve remover tipo que já possua hardware', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem hardwares para esse tipo');
      });
  });

  test('Não deve remover tipo inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um tipo inexistente');
      });
  });
});
