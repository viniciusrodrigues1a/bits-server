const yup = require('yup');
const CreditDestroy = require('../models/credit/CreditDestroy');
const CreditIndex = require('../models/credit/CreditIndex');
const CreditShow = require('../models/credit/CreditShow');
const CreditStore = require('../models/credit/CreditStore');
const CreditUpdate = require('../models/credit/CreditUpdate');
const TransactionBelongsStoreCreditOrDebt = require('../models/transactions/TransactionBelongsStoreCreditOrDebt');
const TransactionBelongsUpdateCreditOrDebt = require('../models/transactions/TransactionBelongUpdateCreditOrDebt');

function DebtController(database) {
  const transactionBelongsStoreCreditOrDebt =
    new TransactionBelongsStoreCreditOrDebt(database);
  const transactionBelongsUpdateCreditOrDebt =
    new TransactionBelongsUpdateCreditOrDebt(database);

  const debtUpdate = new CreditUpdate({ database, table: 'debt' });
  const debtDestroy = new CreditDestroy({ database, table: 'debt' });
  const debtStore = new CreditStore({ database, table: 'debt' });
  const debtIndex = new CreditIndex({ database, table: 'debt' });
  const debtShow = new CreditShow({ database, table: 'debt' });

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
      const insertCreditInTable = await debtStore.execute({
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
      console.log(err);
      return response.status(501).json({
        message: 'internal server error',
      });
    }
  }

  async function index(request, response) {
    const { id } = request.userData;

    const credit = await debtIndex.execute(id);
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

    const { id: debtId } = request.params;

    if (!(await bodySchema.isValid(request.body)) && !debtId) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const data = request.body;
    try {
      const creditOperation = await debtUpdate.execute({
        creditOrDebtId: debtId,
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
      debtId: yup.number().positive().required(),
      dateNow: yup.date().required(),
      description: yup.string(),
      walletId: yup.number(),
      amount: yup.number().positive().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { debtId, dateNow, description, walletId, amount } = request.body;

    try {
      await transactionBelongsStoreCreditOrDebt.store({
        debt_or_credit_id: debtId,
        created_at: dateNow,
        description,
        wallet_id: walletId,
        amount: -Math.abs(amount),
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
          newAmount: -Math.abs(amount),
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
    const { id: debtId } = request.params;

    if (!debtId)
      return response.status(404).json({ message: 'debt not found' });
    const transactions = await debtShow.execute(userId, debtId);

    return response.status(200).json(transactions);
  }

  async function destroy(request, response) {
    const { id } = request.params;

    try {
      await debtDestroy.execute(id);

      return response.status(204).end(0);
    } catch (err) {
      return response.status(501).end();
    }
  }
  return {
    store,
    index,
    show,
    update,
    destroy,
    storeTransaction,
    updatedTransaction,
  };
}

module.exports = DebtController;
