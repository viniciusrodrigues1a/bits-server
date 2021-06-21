const yup = require('yup');
const TransactionBelongsStoreCreditOrDebt = require('../models/transactions/TransactionBelongsStoreCreditOrDebt');
function CreditController(database) {
  const transactionBelongsStoreCreditOrDebt =
    new TransactionBelongsStoreCreditOrDebt(database);
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
      const insertCreditInTable = await database('credit').insert({
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

    const walletsIds = await database('wallet')
      .where({ user_id: id })
      .select('id')
      .then(data => data.map(a => a.id));

    const credits = await database('credit')
      .whereIn('credit.wallet_id', walletsIds)
      .leftJoin(
        'create_credit_or_debt_transaction',
        'create_credit_or_debt_transaction.debt_or_credit_id',
        '=',
        'credit.id'
      )
      .leftJoin(
        'transaction',
        'create_credit_or_debt_transaction.id',
        '=',
        'transaction.transaction_belongs'
      )
      .select(
        'credit.id AS credit_id',
        'credit.amount_necessary',
        'credit.from',
        'credit.wallet_id',
        'credit.description',
        'transaction.amount',
        'credit.dateNow',
        'credit.deadline'
      );

    const tratedObjects = credits.reduce((iterator, object, index) => {
      function verifyObjectAlreadyExist(object) {
        const objectFind = iterator.findIndex(
          ({ credit_id }) => credit_id == object.credit_id
        );
        if (!objectFind) {
          iterator[objectFind].amount += object.amount;
          return iterator;
        } else {
          iterator.push(object);
        }
      }
      index == 0 ? iterator.push(object) : verifyObjectAlreadyExist(object);
      return iterator;
    }, []);

    return response.status(200).json(tratedObjects);
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
  async function show(request, response) {
    const { id } = request.userData;
    const { id: creditId } = request.params;

    const walletsIds = await database('wallet')
      .where({ user_id: id })
      .select('id')
      .then(data => data.map(a => a.id));

    const transactions = await database('create_credit_or_debt_transaction')
      .whereIn('transaction.wallet_id', walletsIds)
      .andWhere('create_credit_or_debt_transaction.debt_or_credit_id', creditId)
      .leftJoin(
        'transaction',
        'transaction.transaction_belongs',
        '=',
        'create_credit_or_debt_transaction.id'
      );

    return response.status(200).json(transactions);
  }

  async function destroy(request, response) {
    return;
  }
  return {
    store,
    update,
    index,
    storeTransaction,
    show,
    destroy,
  };
}

module.exports = CreditController;
