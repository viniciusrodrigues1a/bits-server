const { describe, it, expect, beforeEach } = require('@jest/globals');
const api = require('../helpers/server');
const authorizationHeader = require('../helpers/authToken');
const database = require('../../src/database/connection');

beforeEach(async () => {
  await teardown();
  await setup();
});

async function teardown() {
  await database('transaction').del();
  await database('wallet').del().where({ id: 1 });
}

async function setup() {
  await database('wallet').insert({
    id: 1,
    user_id: 999,
    currency: 'BRL',
    name: 'My wallet',
    balance: 50,
  });

  await database('transaction').insert([
    {
      id: 777,
      wallet_id: 1,
      category_id: 999,
      amount: 25,
      description: 'My transaction',
    },
    {
      id: 778,
      wallet_id: 1,
      category_id: 999,
      amount: -30,
      description: 'My transaction',
    },
  ]);
}

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
      .delete('/transactions/777')
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
      .put('/transactions/777')
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
      .put('/transactions/777')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});

describe('Transaction show endpoint', () => {
  it('should be able to show a transaction', async () => {
    const response = await api
      .get('/transactions/777')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(777);
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
  it('should be able to list all transactions ', async () => {
    const response = await api.get(`/transactions/`).set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it('should be able to list all transactions with date ', async () => {
    const date = new Date();
    const [year, month, day] = [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ];

    const dateFormatted = `${year}-${month}-${day}`;
    const response = await api
      .get(`/transactions/?date=${dateFormatted}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it('should NOT be able to list all transactions, because this date is invalid ', async () => {
    const date = 'asd15155153';
    const response = await api
      .get(`/transactions/?date=${date}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
  });
  it('should NOT be able to list all transactions, because this date it does not have transactions ', async () => {
    const date = '2021-1-21';
    const response = await api
      .get(`/transactions/?date=${date}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
  });

  it('should NOT be able to list all transactions, because this date is invalid', async () => {
    const date = '1859-1-29';
    const response = await api
      .get(`/transactions/?date=${date}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
  });
});

describe('Transaction index month endpoint', () => {
  it('should be able to list all wallets and the summary of their transactions', async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const response = await api
      .get(`/transactions/index/month?year=${year}&month=${month}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.expensesAndIncome['1']).toEqual({
      expenses: -30,
      incomes: 25,
    });
  });

  it('should be able to list a wallet even if no transactions are found', async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() - 1;

    const response = await api
      .get(`/transactions/index/month?year=${year}&month=${month}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.expensesAndIncome['1']).toEqual({
      expenses: 0,
      incomes: 0,
    });
  });

  it('should return 400 if query params are invalid', async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const response = await api
      .get(`/transactions/index/month?year=${year}`)
      .set(authorizationHeader);

    expect(response.statusCode).toBe(400);
  });
});
