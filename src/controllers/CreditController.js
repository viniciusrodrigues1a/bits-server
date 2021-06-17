const yup = require('yup');
const TransactionBelongsCredit = require('../models/transactionsBelongsCredit/TransactionBelongsCreditStore');

function CreditController(database) {
  const transactionBelongsCredit = new TransactionBelongsCredit(database);
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      dateNow: yup.date().required(),
      deadline: yup.date().required(),
      from: yup.string().required(),
      description: yup.string(),
      walletId: yup.number().positive().required(),
      amount: yup.number().positive().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { dateNow, deadline, from, description, walletId, amount } =
      request.body;

    try {
      const insertCreditInTable = await database('credit').insert({
        dateNow,
        deadline,
        from,
        description,
        wallet_id: walletId,
        amount,
      });
    } catch (err) {
      return response.status(501).json({
        message: 'internal server error',
      });
    }

    return response.status(201).json({
      message: 'Credit create has sucess',
    });
  }

  async function update() {
    const bodySchema = yup.object().shape({
      dateNow: yup.date(),
      deadline: yup.date(),
      from: yup.string(),
      description: yup.string(),
      walletId: yup.number(),
      amount: yup.number().positive(),
    });
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
      const transaction = await transactionBelongsCredit.store({
        debt_or_credit_id: creditId,
        created_at: dateNow,
        description,
        wallet_id: walletId,
        amount,
      });

      return response.status(201).end();
    } catch (err) {
      console.log(err, '*****');
      return response.status(501).end();
    }
  }

  return {
    store,
    update,

    storeTransaction,
  };
}

module.exports = CreditController;
