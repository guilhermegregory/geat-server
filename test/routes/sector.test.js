const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/sectors';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAyMDAsIm5hbWUiOiJVc2VyICM0IiwiZW1haWwiOiJ1c2VyNEBlbWFpbC5jb20ifQ.cXhXjidGBxohw2I0G-_Ic39-9_ofWXIzquGbLq0WMmM';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os setores', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve buscar um setor específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um setor com sucesso', () => {
  let sectorBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Sector Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        sectorBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do setor', () => {
    expect(sectorBodyResponse).toHaveProperty('id');
    expect(sectorBodyResponse).toHaveProperty('name');
    expect(sectorBodyResponse.name).toBe('Sector Save');
  });
});

describe('Ao tentar salvar um setor inválido', () => {
  const validSector = { name: 'Sector Invalid' };

  const sectorTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validSector, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => sectorTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => sectorTestTemplate({ name: 'Sector #1' }, 'Já existe um setor com esse nome'));
});

describe('Ao alterar um setor com sucesso', () => {
  let sectorBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Sector #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        sectorBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do setor ', () => {
    expect(sectorBodyResponse).toHaveProperty('id');
    expect(sectorBodyResponse).toHaveProperty('name');
    expect(sectorBodyResponse.name).toBe('Sector #1 Updated');
  });
});

describe('Ao tentar alterar um setor inválido', () => {
  const sectorTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de id', () => sectorTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => sectorTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => sectorTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração para nome que já exista', () => sectorTestTemplate({ name: 'Sector #1 Updated' }, 'Já existe um setor com esse nome'));

  test('Não deve alterar setor inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Sector Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar setor inexistente');
      });
  });
});

describe('Ao remover um setor com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O setor deve ter sido removido do banco', () => {
    return app.db('sectors').where({ id: 10001 }).select()
      .then((users) => {
        expect(users).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um setor inválido', () => {
  test('Não deve remover setor que já possua colaborador', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem colaboradores para esse setor');
      });
  });

  test('Não deve remover setor inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um setor inexistente');
      });
  });
});
