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

  it('should be NOT able to index credits, because you dont have a credit', async () => {
    const response = await api.get('/credit').set;
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

    const { balance } = await databaseHelper
      .database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();

    expect(balance).toEqual(250);

    expect(response.statusCode).toEqual(201);
  });
});

describe('update transaction endpoint', () => {
  let walletId;

  let creditId;
  let transactionId;

  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet({ userId, balance: 200 })).id;
    creditId = (await databaseHelper.insertCredit({ walletId })).id;
    transactionId = (
      await databaseHelper.insertTransaction({
        walletId,
        amount: 50,
        debt_or_credit_id: creditId,
      })
    ).id;
  });

  it('should be able to update transaction in credit', async () => {
    const response = await api
      .put(`/credit/transaction/${transactionId}`)
      .set(authorizationHeader)
      .send({
        amount: 100,
        notion: 'testing',
      });

    const { balance } = await databaseHelper
      .database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();

    expect(response.body.description).toEqual('testing');
    expect(response.statusCode).toEqual(200);
    expect(balance).toEqual(300);
  });
});

describe('update credit endpoint', () => {
  let walletId;

  let creditId;
  let transactionId;

  let walletId2;
  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet({ userId, balance: 200 })).id;
    walletId2 = (await databaseHelper.insertWallet({ userId, balance: 200 }))
      .id;
    creditId = (await databaseHelper.insertCredit({ walletId, amount: 250 }))
      .id;
    transactionId = (
      await databaseHelper.insertTransaction({
        walletId,
        amount: 50,
        debt_or_credit_id: creditId,
      })
    ).id;
    transactionId2 = (
      await databaseHelper.insertTransaction({
        walletId,
        amount: 50,
        debt_or_credit_id: creditId,
      })
    ).id;
  });

  it('should be able to update amount necessary in credit', async () => {
    const response = await api
      .put(`/credit/${creditId}`)
      .set(authorizationHeader)
      .send({
        amount_necessary: 500,
      });

    const { balance } = await databaseHelper
      .database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();

    expect(response.statusCode).toEqual(200);
    expect(response.body.amount_necessary).toEqual(500);
    expect(balance).toEqual(300);
  });

  it('should be able to update wallet  in credit', async () => {
    const response = await api
      .put(`/credit/${creditId}`)
      .set(authorizationHeader)
      .send({
        amount_necessary: 800,
        walletId: walletId2,
      });

    const { balance: currentBalance } = await databaseHelper
      .database('wallet')
      .where({ id: walletId2 })
      .select('*')
      .first();

    const { balance: oldBalance } = await databaseHelper
      .database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();
    const transaction = await databaseHelper
      .database('transaction')
      .where({ id: transactionId })
      .select('*')
      .first();

    const transaction1 = await databaseHelper
      .database('transaction')
      .where({ id: transactionId2 })
      .select('*')
      .first();
    expect(response.statusCode).toEqual(200);
    expect(response.body.amount_necessary).toEqual(800);
    expect(response.body.wallet_id).toEqual(walletId2);
    expect(transaction.wallet_id).toEqual(walletId2);
    expect(transaction1.wallet_id).toEqual(walletId2);
    expect(currentBalance).toEqual(300);
    expect(oldBalance).toEqual(200);
  });
});

describe('destroy credit endpoint', () => {
  let walletId;
  let creditId;

  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet({ userId, balance: 100 })).id;

    creditId = (await databaseHelper.insertCredit({ walletId, amount: 250 }))
      .id;

    await databaseHelper.insertTransaction({
      walletId,
      amount: 50,
      debt_or_credit_id: creditId,
    });

    await databaseHelper.insertTransaction({
      walletId,
      amount: 50,
      debt_or_credit_id: creditId,
    });
  });

  it('should be able to delete credit', async () => {
    await api.delete(`/credit/${creditId}`).set(authorizationHeader);

    const { balance } = await databaseHelper
      .database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();

    expect(balance).toEqual(100);
  });
});
