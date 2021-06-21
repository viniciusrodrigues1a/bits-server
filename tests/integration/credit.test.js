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
const database = require('../helpers/database');

let authorizationHeader;
let userId;

beforeEach(async () => {
  const { id } = await databaseHelper.insertUser();

  userId = id;
  authorizationHeader = createToken(id);
});

afterEach(async () => {
  await databaseHelper.database('credit').del();
  await databaseHelper.database('wallet').del();
  await databaseHelper.database('user').del();
});

describe('Credit creation endpoint', () => {
  let walletId;

  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet()).id;
  });

  it('should be able to create a new credit', async () => {
    const response = await api.post('/credit').set(authorizationHeader).send({
      amountNecessary: 100,
      dateNow: new Date(),
      deadline: new Date(),
      from: 'Boss',
      description: 'payment',
      walletId: walletId,
    });
    expect(response.statusCode).toEqual(201);
  });

  it('should NOT be able to create a new credit', async () => {
    const response = await api.post('/credit').set(authorizationHeader).send({
      amountNecessary: 100,
      dateNow: new Date(),
      deadline: new Date(),
      from: 'Boss',
      description: 'payment',
    });
    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to create a new credit because amount ins negative', async () => {
    const response = await api.post('/credit').set(authorizationHeader).send({
      amountNecessary: -100,
      dateNow: new Date(),
      deadline: new Date(),
      from: 'Boss',
      description: 'payment',
    });
    expect(response.statusCode).toEqual(400);
  });
});

describe('index credit endpoint', () => {
  beforeEach(async () => {
    const { id: walletId } = await databaseHelper.insertWallet({
      userId,
      balance: 200,
    });
    const creditId = (
      await databaseHelper.insertCredit({ walletId, amount: 100 })
    ).id;

    await databaseHelper.insertTransaction({
      debt_or_credit_id: creditId,
      walletId,
      amount: 10,
    });
    await databaseHelper.insertTransaction({
      debt_or_credit_id: creditId,
      walletId,
      amount: 10,
    });
  });

  it('should be able to index credits', async () => {
    const response = await api.get('/credit').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body[0].amount_necessary).toEqual(100);
    expect(response.body[0].amount).toEqual(20);
  });
});

describe('index credit endpoint', () => {
  let creditId;
  beforeEach(async () => {
    const { id: walletId } = await databaseHelper.insertWallet({
      userId,
      balance: 200,
    });
    creditId = (await databaseHelper.insertCredit({ walletId, amount: 100 }))
      .id;
    await databaseHelper.insertTransaction({
      debt_or_credit_id: creditId,
      walletId,
      amount: 10,
    });
    await databaseHelper.insertTransaction({
      debt_or_credit_id: creditId,
      walletId,
      amount: 10,
    });
  });
  it('should be able to show credit', async () => {
    const response = await api
      .get(`/credit/${creditId}`)
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toEqual(2);
  });
});

describe('store transaction creation endpoint', () => {
  let walletId;
  let creditId;
  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet({ userId, balance: 200 })).id;
    creditId = (await databaseHelper.insertCredit({ walletId })).id;
  });

  it('should be able to create a new transaction in credit', async () => {
    const response = await api
      .post('/credit/transaction')
      .set(authorizationHeader)
      .send({
        dateNow: new Date(),
        description: 'My boss paying me 50 dolars',
        walletId,
        creditId,
        amount: 50,
      });

    const walletBalance = await databaseHelper.getWallet(walletId);

    expect(walletBalance.balance).toEqual(250);

    expect(response.statusCode).toEqual(201);
  });
});
