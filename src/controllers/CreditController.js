const yup = require('yup');
const CreditDestroy = require('../models/credit/CreditDestroy');
const CreditIndex = require('../models/credit/CreditIndex');
const CreditShow = require('../models/credit/CreditShow');
const CreditStore = require('../models/credit/CreditStore');
const CreditUpdate = require('../models/credit/CreditUpdate');
const TransactionBelongsStoreCreditOrDebt = require('../models/transactions/TransactionBelongsStoreCreditOrDebt');
const TransactionBelongsUpdateCreditOrDebt = require('../models/transactions/TransactionBelongUpdateCreditOrDebt');

function CreditController(database) {
  const transactionBelongsStoreCreditOrDebt =
    new TransactionBelongsStoreCreditOrDebt(database);
  const transactionBelongsUpdateCreditOrDebt =
    new TransactionBelongsUpdateCreditOrDebt(database);

  const creditUpdate = new CreditUpdate({ database, table: 'credit' });
  const creditDestroy = new CreditDestroy({ database, table: 'credit' });
  const creditStore = new CreditStore({ database, table: 'credit' });
  const creditIndex = new CreditIndex({ database, table: 'credit' });
  const creditShow = new CreditShow({ database, table: 'credit' });

  async function store(request, response) {
    const bodySchema = yup.object().shape({
      dateNow: yup.date().required(),
      deadline: yup.date().required(),
      from: yup.string().required(),
      description: yup.string(),
      walletId: yup.number().positive().required(),
      amountNecessary: yup.number().positive().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { dateNow, deadline, from, description, walletId, amountNecessary } =
      request.body;

    try {
      const insertCreditInTable = await creditStore.execute({
        dateNow,
        deadline,
        from,
        description,
        wallet_id: walletId,
        amount_necessary: amountNecessary,
      });

      return response.status(201).json({
        message: 'Credit create has sucess',
        data: insertCreditInTable,
      });
    } catch (err) {
      return response.status(501).json({
        message: 'internal server error',
      });
    }
  }

  async function index(request, response) {
    const { id } = request.userData;

    const credit = await creditIndex.execute(id);
    return response.status(200).json(credit);
  }
  async function update(request, response) {
    const bodySchema = yup.object().shape({
      dateNow: yup.date(),
      deadline: yup.date(),
      from: yup.string(),
      description: yup.string(),
      walletId: yup.number(),
      amount_necessary: yup.number().positive(),
    });

    const { id: creditOrDebtId } = request.params;

    if (!(await bodySchema.isValid(request.body)) && !creditId) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const data = request.body;
    try {
      const creditOperation = await creditUpdate.execute({
        creditOrDebtId,
        ...data,
      });

      return response.status(200).json(creditOperation);
    } catch (err) {
      console.log(err);
      return response.status(501).end();
    }
  }

  async function storeTransaction(request, response) {
    const bodySchema = yup.object().shape({
      creditId: yup.number().positive().required(),
      dateNow: yup.date().required(),
      description: yup.string(),
      walletId: yup.number(),
      amount: yup.number().positive().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { creditId, dateNow, description, walletId, amount } = request.body;

    try {
      await transactionBelongsStoreCreditOrDebt.store({
        debt_or_credit_id: creditId,
        created_at: dateNow,
        description,
        wallet_id: walletId,
        amount,
      });

      return response.status(201).end();
    } catch (err) {
      return response.status(501).end();
    }
  }

  async function updatedTransaction(request, response) {
    const bodySchema = yup.object().shape({
      transactionId: yup.number().positive(),
      walletId: yup.number().positive(),
      amount: yup.number().positive(),
      notion: yup.string(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }
    const { amount, notion } = request.body;

    const { id: transaction_id } = request.params;

    try {
      const updatedTransaction =
        await transactionBelongsUpdateCreditOrDebt.execute({
          newAmount: amount,
          description: notion,
          transaction_id,
        });
      return response.status(200).json(updatedTransaction);
    } catch (err) {
      console.log(err);
      return response.status(501).json({
        message: 'internal server error!',
      });
    }
  }
  async function show(request, response) {
    const { id: userId } = request.userData;
    const { id: creditId } = request.params;

    // const walletsIds = await database('wallet')
    //   .where({ user_id: userId })
    //   .select('id')
    //   .then(data => data.map(a => a.id));

    // const transactions = await database('create_credit_or_debt_transaction')
    //   .whereIn('transaction.wallet_id', walletsIds)
    //   .andWhere('create_credit_or_debt_transaction.debt_or_credit_id', creditId)
    //   .leftJoin(
    //     'transaction',
    //     'transaction.transaction_belongs',
    //     '=',
    //     'create_credit_or_debt_transaction.id'
    //   );

    const transactions = await creditShow.execute(userId, creditId);

    return response.status(200).json(transactions);
  }

  async function destroy(request, response) {
    const { id } = request.params;

    try {
      await creditDestroy.execute(id);

      return response.status(204).end(0);
    } catch (err) {
      return response.status(501).end();
    }
  }
  return {
    store,
    update,
    index,
    storeTransaction,
    updatedTransaction,
    show,
    destroy,
  };
}

module.exports = CreditController;
