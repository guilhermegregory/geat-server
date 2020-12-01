const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/auth';

beforeAll(async () => {
  await app.db.seed.run();
});

describe('Ao criar um usuário via signup', () => {
  let userBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(`${MAIN_ROUTE}/signup`)
      .send({ name: 'User Signup', email: 'userSignup@email.com', password: '123456' })
      .then((res) => {
        expect(res.status).toBe(201);
        userBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, name, e email do usuário', () => {
    expect(userBodyResponse).toHaveProperty('id');
    expect(userBodyResponse).toHaveProperty('name');
    expect(userBodyResponse.name).toBe('User Signup');
    expect(userBodyResponse).toHaveProperty('email');
    expect(userBodyResponse.email).toBe('userSignup@email.com');
  });

  test('Não deve retornar a senha do usuário', () => {
    expect(userBodyResponse).not.toHaveProperty('password');
  });

  test('Deve armazenar senha criptograda', async () => {
    const userDb = await app.services.user.find({ id: userBodyResponse.id });
    expect(userDb[0].password).not.toBe('123456');
  });
});

describe('Ao tentar criar um usuário via signup inválido', () => {
  const validUser = { name: 'User Invalid Signup', email: 'userInvalidSignup@email.com', password: '123456' };

  const userTestTemplate = (newData, errorMessage) => {
    return request(app).post(`${MAIN_ROUTE}/signup`)
      .send({ ...validUser, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve criar sem nome', () => userTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve criar sem email', () => userTestTemplate({ email: null }, 'E-mail é um atributo obrigatório'));
  test('Não deve criar sem senha', () => userTestTemplate({ password: null }, 'Senha é um atributo obrigatório'));
  test('Não deve criar com email existente', () => userTestTemplate({ email: 'user1@email.com' }, 'Já existe um usuário com esse e-mail'));
});

describe('Ao autenticar via signin', () => {
  let userBodyResponse;

  test('Deve retornar o status 200', () => {
    return request(app).post(`${MAIN_ROUTE}/signin`)
      .send({ email: 'user3@email.com', password: '123456' })
      .then((res) => {
        expect(res.status).toBe(200);
        userBodyResponse = res.body;
      });
  });

  test('Deve retornar o token', () => {
    expect(userBodyResponse).toHaveProperty('token');
    expect(userBodyResponse).toHaveProperty('userData');
    expect(userBodyResponse.userData).toHaveProperty('name');
    expect(userBodyResponse.userData).toHaveProperty('email');
    expect(userBodyResponse.userData).toHaveProperty('avatar');
  });
});

describe('Ao tentar autenticar via signin inválido', () => {
  const validSignin = { email: 'user3@email.com', password: '123456' };

  const signinTestTemplate = (newData, errorMessage) => {
    return request(app).post(`${MAIN_ROUTE}/signin`)
      .send({ ...validSignin, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve autenticar com senha errada', () => signinTestTemplate({ password: '1234567' }, 'Usuário ou senha inválidos'));
  test('Não deve autenticar com email que não está cadastrado', () => signinTestTemplate({ email: 'notCad@email.com' }, 'Usuário ou senha inválidos'));
  test('Não deve autenticar sem e-mail', () => signinTestTemplate({ email: null }, 'E-mail é um atributo obrigatório'));
  test('Não deve autenticar sem senha', () => signinTestTemplate({ password: null }, 'Senha é um atributo obrigatório'));
});

test('Não deve acessar uma rota protegida sem token', () => {
  return request(app).get('/v1/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});
