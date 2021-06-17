const { describe, it, expect, beforeAll, afterEach } = require('@jest/globals');
const api = require('../helpers/server');
const { createToken } = require('../helpers/token');
const { databaseHelper } = require('../helpers/database');

let authorizationHeader;
let userId;

beforeEach(async () => {
  const { id } = await databaseHelper.insertUser();

  userId = id;
  authorizationHeader = createToken(id);
});

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

describe('Wallet creation endpoint', () => {
  it('should be able to create a wallet', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'Despesas',
      balance: 100,
      currency: 'BRL',
    });

    expect(response.statusCode).toEqual(201);
  });

  it('should NOT be able to create a wallet with a balance less than 0', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'Despesas',
      balance: -1,
      currency: 'BRL',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to create a wallet if required fields are missing', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'Despesas',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to create a wallet if user already has one of same name', async () => {
    const name = 'My wallet';

    await databaseHelper.insertWallet({ name, userId });

    const response = await api.post('/wallet').set(authorizationHeader).send({
      name,
      balance: 100,
      currency: 'BRL',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Wallet of same name already exists');
  });
});

describe('Wallet update endpoint', () => {
  it("should be able to update a wallet's balance", async () => {
    const { id } = await databaseHelper.insertWallet({ userId });

    const response = await api
      .put(`/wallet/${id}`)
      .set(authorizationHeader)
      .send({
        balance: 110,
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should be able to update a wallet's name", async () => {
    const { id } = await databaseHelper.insertWallet({ userId });

    const response = await api
      .put(`/wallet/${id}`)
      .set(authorizationHeader)
      .send({
        name: 'Updated name',
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to update a wallet that doesn't exist", async () => {
    const response = await api
      .put('/wallet/194418')
      .set(authorizationHeader)
      .send({
        balance: 110,
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });

  it('should NOT be able to update a wallet if no field is present', async () => {
    const response = await api
      .put('/wallet/999')
      .set(authorizationHeader)
      .send({});

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});

describe('Wallet show endpoint', () => {
  it('should be able to show a wallet', async () => {
    const { id, balance } = await databaseHelper.insertWallet({ userId });

    const response = await api.get(`/wallet/${id}`).set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(id);
    expect(response.body.balance).toEqual(balance);
  });

  it("should NOT be able to show a wallet if it doesn't exist", async () => {
    const response = await api.get('/wallet/1941914').set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });

  it('should NOT be able to show a wallet that is not owned by the user making the request', async () => {
    const { id } = await databaseHelper.insertWallet();

    const response = await api.get(`/wallet/${id}`).set(authorizationHeader);

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual('This wallet is not yours');
  });
});

describe('Wallet deletion', () => {
  it('should be able to delete a wallet', async () => {
    const { id } = await databaseHelper.insertWallet({ userId });

    const response = await api.delete(`/wallet/${id}`).set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to delete a wallet that doesn't exist", async () => {
    const response = await api
      .delete('/wallet/1941914')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });

  it('should NOT be able to delete a wallet that is not owned by the user making the request', async () => {
    const { id } = await databaseHelper.insertWallet();

    const response = await api.delete(`/wallet/${id}`).set(authorizationHeader);

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual('This wallet is not yours');
  });
});

describe('Wallet index endpoint', () => {
  it("should be able to list all user's wallets", async () => {
    await databaseHelper.insertWallet({ userId });
    await databaseHelper.insertWallet({ userId });

    const response = await api.get('/wallet').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toEqual(2);
  });

  it('should return 404 if no wallet is found', async () => {
    const { id } = await databaseHelper.insertUser();
    const token = createToken(id);

    const response = await api.get('/wallet').set(token);

    expect(response.statusCode).toEqual(404);
  });
});
