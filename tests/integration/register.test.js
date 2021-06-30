const { describe, it, expect, afterEach } = require('@jest/globals');
const api = require('../helpers/server');
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

describe('Account creation endpoint', () => {
  it('should be able to create a new user', async () => {
    const response = await api.post('/signup').send({
      name: 'Wellington Júnior',
      email: 'wellington53@gmail.com',
      password: 'pa55word',
    });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should NOT be able to create a new user if email is already in use', async () => {
    await databaseHelper.insertUser({ email: 'inuse@gmail.com' });

    const response = await api.post('/signup').send({
      name: 'Rodrigo',
      email: 'inuse@gmail.com',
      password: 'pa55word',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Email not available!');
  });

  it('should NOT be able to create a new user if required fields are missing', async () => {
    const response = await api.post('/signup').send({
      name: 'Éverton Reis',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to create a new user if password length is less than 8 chars long', async () => {
    const response = await api.post('/signup').send({
      name: 'Éverton Reis',
      password: 'less8',
      email: 'everton_reis@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});
