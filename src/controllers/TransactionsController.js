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
    const transactions = await database('transaction').select('*');

    return response.status(200).json({ transactions });
  }

  return {
    store,
    destroy,
    update,
    show,
    index,
  };
}

module.exports = TransactionsController;
