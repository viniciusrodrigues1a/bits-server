const yup = require('yup');

function TransactionsController(database) {
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

    const wallet = await database('wallet')
      .where({
        id: walletId,
      })
      .select('*')
      .first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    const [transaction] = await database('transaction')
      .insert({
        category_id: categoryId,
        wallet_id: walletId,
        amount,
        incoming,
        description,
      })
      .returning('*');

    return response.status(201).json({ ...transaction });
  }

  async function destroy(request, response) {
    const { id } = request.params;

    const transaction = await database('transaction')
      .where({ id })
      .select('*')
      .first();

    if (!transaction) {
      return response.status(400).json({
        message: 'Transaction not found',
      });
    }

    await database('transaction').where({ id }).del();

    return response.status(200).end();
  }

  async function update(request, response) {
    const { amount, description } = request.body;

    if (!amount && !description) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id } = request.params;

    const transaction = await database('transaction')
      .where({ id })
      .select('*')
      .first();

    if (!transaction) {
      return response.status(404).json({ message: 'Transaction not found' });
    }

    const [updatedTransaction] = await database('transaction')
      .where({ id })
      .update({
        amount,
        description,
      })
      .returning('*');

    return response.status(200).json({ ...updatedTransaction });
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
    const { id: userId } = request.userData;

    const walletsUsers = await database('wallet')
      .where({ user_id: userId })
      .select('id')
      .then(data => data.map(a => a.id));

    const transactions = await database('transaction')
      .whereIn('wallet_id', walletsUsers)
      .select('*');

    return response.status(200).json({ transactions });
  }

  async function getExpensesAndIncomes(request, response) {
    const querySchema = yup.object().shape({
      year: yup.number().min(2021).required(),
      month: yup.number().min(1).max(12).required(),
    });

    if (!(await querySchema.isValid(request.query))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { year, month } = request.query;
    const { id: userId } = request.userData;

    const walletsUsersIds = await database('wallet')
      .where({ user_id: userId })
      .select('id')
      .then(data => data.map(a => a.id));

    const monthIndex = month - 1;
    const from = new Date(year, monthIndex, 1);
    const to = new Date(year, monthIndex + 1, 0);

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
