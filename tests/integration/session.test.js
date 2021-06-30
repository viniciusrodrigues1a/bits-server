const { describe, it, expect, afterEach } = require('@jest/globals');
const api = require('../helpers/server');
const { createToken } = require('../helpers/token');
const { databaseHelper } = require('../helpers/database');

afterEach(async () => {
  await databaseHelper.database('scheduled_transaction_category').del();
  await databaseHelper.database('budget_categories').del();
  await databaseHelper.database('budget').del();
  await databaseHelper.database('transaction').del();
  await databaseHelper.database('category').del();
  await databaseHelper.database('scheduled_transaction').del();
  await databaseHelper.database('credit').del();
  await databaseHelper.database('wallet').del();
  await databaseHelper.database('user').del();
});

describe('Session creation endpoint', () => {
  it('should be able to login', async () => {
    await databaseHelper.insertUser({
      email: 'user@gmail.com',
      password: 'pa55word',
    });

    const response = await api.post('/session').send({
      password: 'pa55word',
      email: 'user@gmail.com',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should NOT be able to login if required fields are missing', async () => {
    const response = await api.post('/session').send({
      email: 'everton@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to login if password is wrong', async () => {
    await databaseHelper.insertUser({
      email: 'user@gmail.com',
      password: 'pa55word',
    });

    const response = await api.post('/session').send({
      password: 'wrongpa55',
      email: 'user@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Wrong password!');
  });

  it('should NOT be able to login if email is wrong', async () => {
    await databaseHelper.insertUser({
      email: 'user@gmail.com',
      password: 'pa55word',
    });

    const response = await api.post('/session').send({
      password: 'pa55word',
      email: 'wrong@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Wrong email!');
  });
});

describe('Token validation endpoint', () => {
  it('should return 200 when token is valid', async () => {
    const { id } = await databaseHelper.insertUser();
    const authorizationHeader = createToken(id);

    const response = await api.get('/session').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it('should return 401 when token is not valid', async () => {
    const response = await api
      .get('/session')
      .set({ Authorization: 'Bearer invalidToken' });

    expect(response.statusCode).toEqual(401);
  });
});
