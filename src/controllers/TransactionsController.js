const yup = require('yup');
const { Temporal } = require('proposal-temporal');
const TransactionDestroy = require('../models/transactions/TransactionDestroy');
const TransactionStore = require('../models/transactions/TransactionStore');
const TransactionUpdate = require('../models/transactions/TransactionUpdate');

function TransactionsController(database) {
  const transactionStore = new TransactionStore(database);
  const transactionUpdate = new TransactionUpdate(database);
  const transactionDestroy = new TransactionDestroy(database);

  async function store(request, response) {
    const bodySchema = yup.object().shape({
      walletId: yup.number().positive().required(),
      amount: yup.number().required(),
      incoming: yup.boolean(),
      categoryId: yup.number().positive(),
      description: yup.string(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const {
      amount,
      incoming,
      categoryId,
      walletId,
      description,
    } = request.body;

    try {
      const [transaction] = await transactionStore.execute({
        amount,
        incoming,
        category_id: categoryId,
        wallet_id: walletId,
        description,
      });

      return response.status(201).json({ ...transaction });
    } catch (err) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }
  }

  async function destroy(request, response) {
    const { id } = request.params;

    try {
      await transactionDestroy.execute(id);

      return response.status(200).end();
    } catch (err) {
      if ((err.message = 'transaction not found')) {
        return response.status(400).json({
          message: 'Transaction not found',
        });
      }

      return response.status(500).json({
        message: 'internal server error',
      });
    }
  }

  async function update(request, response) {
    const { amount, description } = request.body;

    const { id: transaction_id } = request.params;
    if (!amount && !description) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    try {
      const updatedTransaction = await transactionUpdate.execute({
        newAmount: amount,
        description,
        transaction_id,
      });

      return response.status(200).json({ ...updatedTransaction });
    } catch (err) {
      return response.status(404).json({ message: 'Transaction not found' });
    }
  }

  async function show(request, response) {
    const { id } = request.params;

    const transaction = await database('transaction')
      .where({ id })
      .select('*')
      .first();

    if (!transaction) {
      return response.status(404).json({
        message: 'Transaction not found',
      });
    }

    return response.status(200).json({ ...transaction });
  }

  async function index(request, response) {
    const querySchema = yup.object().shape({
      date: yup.string().min(12).max(14),
      page: yup.number().positive(),
      timezoneOffset: yup.number().integer(),
    });

    if (!(await querySchema.isValid(request.query))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id: userId } = request.userData;
    const { date, page = 1, timezoneOffset = 0 } = request.query;

    const limitElementsForPage = 10;

    const transactionsQuery = database('transaction')
      .limit(limitElementsForPage)
      .offset((page - 1) * limitElementsForPage)
      .leftJoin('wallet', 'wallet.id', '=', 'transaction.wallet_id')
      .innerJoin('user', 'user.id', '=', 'wallet.user_id')
      .where('user.id', `${userId}`)
      .orderBy('created_at', 'desc')
      .select('transaction.*', 'wallet.name as wallet_name');

    if (date) {
      const dateTime = Temporal.Instant.fromEpochMilliseconds(date).add({
        minutes: timezoneOffset,
      });
      console.log(dateTime, 'OLHA O DATETIME');
      transactionsQuery.andWhere('created_at', '<=', dateTime);
    }
    const transactions = await transactionsQuery;

    if (transactions.length == 0) {
      return response.status(404).json({
        message: "you don't have transactions in date",
      });
    }

    return response.status(200).json({ transactions });
  }

  async function getExpensesAndIncomes(request, response) {
    const querySchema = yup.object().shape({
      year: yup.number().min(2021).required(),
      month: yup.number().min(1).max(12).required(),
      timezoneOffset: yup.number().integer(),
    });

    if (!(await querySchema.isValid(request.query))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { year, month, timezoneOffset = 0 } = request.query;
    const { id: userId } = request.userData;

    const walletsUsersIds = await database('wallet')
      .where({ user_id: userId })
      .select('id')
      .then(data => data.map(a => a.id));

    let timezoneInHour = timezoneOffset ? timezoneOffset / 60 : 0;

    const from = Temporal.PlainDateTime.from({
      year,
      month,
      day: 1,
      hour: 0,
    }).add({ hours: timezoneInHour });

    const to = Temporal.PlainDateTime.from({
      year,
      month,
      day: 32,
      hour: 0,
    }).add({ hours: timezoneInHour });

    console.log(from, 'patolino1');
    console.log(to, 'patolino2');

    // const from = new Date(year, monthIndex, 1);
    // const to = new Date(
    //   year,
    //   monthIndex + 1,
    //   0,
    //   23 + timezoneOffset / 60,
    //   59,
    //   59
    // );

    const transactions = await database('transaction')
      .whereIn('wallet_id', walletsUsersIds)
      .whereBetween('created_at', [from, to])
      .select('*');

    let data = {};

    walletsUsersIds.forEach(id => {
      if (!(id in data)) {
        data[id] = {
          expenses: 0,
          incomes: 0,
        };
      }
    });

    data = transactions.reduce((acc, transaction, _) => {
      if (transaction.amount < 0) {
        acc[`${transaction.wallet_id}`].expenses += transaction.amount;
      } else {
        acc[`${transaction.wallet_id}`].incomes += transaction.amount;
      }

      return acc;
    }, data);

    return response.status(200).json({ expensesAndIncome: data });
  }

  return {
    store,
    destroy,
    update,
    show,
    index,
    getExpensesAndIncomes,
  };
}

module.exports = TransactionsController;
