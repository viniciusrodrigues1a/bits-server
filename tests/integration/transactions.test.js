const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');
const authorizationHeader = require('../helpers/authToken');

describe('Transaction creation endpoint', () => {
  it('should be able to create a new transaction with a positive amount (income)', async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        amount: 400,
        incoming: true,
        walletId: 999,
        categoryId: 999,
        description: 'My transaction',
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('category_id');
    expect(response.body).toHaveProperty('wallet_id');
    expect(response.body).toHaveProperty('wallet_id');
    expect(response.body).toHaveProperty('incoming');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('created_at');
  });

  it('should be able to create a new transaction with a negative amount (expense)', async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        amount: -400,
        incoming: true,
        walletId: 999,
        categoryId: 999,
        description: 'My transaction',
      });

    expect(response.statusCode).toEqual(201);
  });

  it('should NOT be able to create a new transaction if required fields are missing', async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        incoming: true,
        walletId: 999,
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it("should NOT be able to create a new transaction if wallet doesn't exist", async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        amount: -400,
        walletId: 14141418,
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });
});

describe('Destroy transaction endpoint', () => {
  it('should be able to delete a transaction', async () => {
    const response = await api
      .delete('/transactions/1002')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to delete a transaction that doesn't exist", async () => {
    const response = await api
      .delete('/transactions/18418144')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Transaction not found');
  });
});

describe('Update transaction endpoint', () => {
  it('should be able to update a transaction', async () => {
    const response = await api
      .put('/transactions/1000')
      .set(authorizationHeader)
      .send({
        amount: 15,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toEqual(15);
  });

  it("should NOT be able to update a transaction that doesn't exist", async () => {
    const response = await api
      .put('/transactions/1491481418')
      .set(authorizationHeader)
      .send({
        amount: 30,
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Transaction not found');
  });

  it('should NOT be able to update a transaction if no field is present', async () => {
    const response = await api
      .put('/transactions/1000')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});

describe('Transaction show endpoint', () => {
  it('should be able to show a transaction', async () => {
    const response = await api
      .get('/transactions/999')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(999);
  });

  it("should NOT be able to show a transaction that doesn't exist", async () => {
    const response = await api
      .get('/transactions/1291291')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Transaction not found');
  });
});

describe('Transaction index endpoint', () => {
  it('should be able to list all transactions', async () => {
    const response = await api.get('/transactions').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });
});
