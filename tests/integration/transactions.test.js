const {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} = require('@jest/globals');
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

describe('Transaction creation endpoint', () => {
  let walletId;
  let categoryId;

  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet()).id;
    categoryId = (await databaseHelper.insertCategory()).id;
  });

  it('should be able to create a new transaction with a positive amount', async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        amount: 400,
        walletId,
        categoryId,
        description: 'My transaction',
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body.amount).toEqual(400);
  });

  it('should be able to create a new transaction with a negative amount', async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        amount: -400,
        walletId,
        categoryId,
        description: 'My transaction',
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body.amount).toEqual(-400);
  });

  it('should NOT be able to create a new transaction if required fields are missing', async () => {
    const response = await api
      .post('/transactions')
      .set(authorizationHeader)
      .send({
        walletId,
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
    const { id } = await databaseHelper.insertTransaction();

    const response = await api
      .delete(`/transactions/${id}`)
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
    const { id } = await databaseHelper.insertTransaction();

    const newDescriptionMsg = 'My updated transaction description';

    const response = await api
      .put(`/transactions/${id}`)
      .set(authorizationHeader)
      .send({
        amount: 15,
        description: newDescriptionMsg,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(id);
    expect(response.body.amount).toEqual(15);
    expect(response.body.description).toEqual(newDescriptionMsg);
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
    const { id } = await databaseHelper.insertTransaction();

    const response = await api
      .put(`/transactions/${id}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});

describe('Transaction show endpoint', () => {
  it('should be able to show a transaction', async () => {
    const { id, description } = await databaseHelper.insertTransaction();

    const response = await api
      .get(`/transactions/${id}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(id);
    expect(response.body.description).toEqual(description);
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
  beforeEach(async () => {
    const { id: walletId } = await databaseHelper.insertWallet({ userId });
    await databaseHelper.insertTransaction({ walletId });
    await databaseHelper.insertTransaction({ walletId });
    await databaseHelper.insertTransaction();
  });

  it('should be able to list all transactions that the signed in user has', async () => {
    const response = await api.get('/transactions/').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.transactions.length).toEqual(2);
  });

  it('should be able to list all transactions with date', async () => {
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

  it('should NOT be able to list all transactions, because this date is invalid', async () => {
    const date = 'asd15155153';
    const response = await api
      .get(`/transactions/?date=${date}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to list all transactions, because this date it does not have transactions', async () => {
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
  beforeEach(async () => {
    const { id } = await databaseHelper.insertWallet({ userId });
    await databaseHelper.insertTransaction({ id });
  });

  it('should be able to list all wallets and the summary of their transactions', async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const response = await api
      .get(`/transactions/index/month?year=${year}&month=${month}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(Object.keys(response.body.expensesAndIncome).length).toEqual(1);
  });

  it("should NOT list transactions made to wallets that the user doesn't own", async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const { id } = await databaseHelper.insertWallet();

    const response = await api
      .get(`/transactions/index/month?year=${year}&month=${month}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.expensesAndIncome[id]).toBe(undefined);
  });

  it('should be able to list a wallet even if no transactions are found', async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() - 1;

    const { id } = await databaseHelper.insertWallet({
      userId,
    });

    const response = await api
      .get(`/transactions/index/month?year=${year}&month=${month}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.expensesAndIncome[id]).toEqual({
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
