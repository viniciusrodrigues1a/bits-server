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

    const { amount, incoming, categoryId, walletId, description } =
      request.body;

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

  async function getExpensesAndRecipesMonth(request, response) {
    const { date } = request.body;
    const { id: userId } = request.userData;

    const walletsUsers = await database('wallet')
      .where({ user_id: userId })
      .select('id')
      .then(data => data.map(a => a.id));

    const transactions = await database('transaction')
      .whereIn('wallet_id', walletsUsers)
      .where('created_at', '<', `${date}T00:00`)
      .select('*');

    if (transactions.length <= 0) {
      return response.status(400).end();
    }

    const data = transactions.reduce(
      (data, transaction, index) => {
        transaction.amount < 0
          ? (data.expenses += transaction.amount)
          : (data.recipes += transaction.amount);

        return data;
      },
      { expenses: 0, recipes: 0 }
    );

    return response.status(200).json({ expensesAndRecipe: data });
  }

  return {
    store,
    destroy,
    update,
    show,
    index,
    getExpensesAndRecipesMonth,
  };
}

module.exports = TransactionsController;
