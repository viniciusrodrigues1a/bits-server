const yup = require('yup');

function BudgetsController(database) {
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      categoriesId: yup.array().of(yup.number().positive()).required(),
      walletId: yup.number().positive().required(),
      amountPaid: yup.number().positive().required(),
      amountTotal: yup.number().positive().required(),
      name: yup.string().required(),
      description: yup.string().required(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const {
      categoriesId,
      amountPaid,
      amountTotal,
      name,
      description,
      walletId,
    } = request.body;

    const wallet = await database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    const [budget] = await database('budget')
      .insert({
        name,
        description,
        wallet_id: walletId,
        amount_paid: amountPaid,
        amount_total: amountTotal,
      })
      .returning('*');

    const formattedCategoriesId = categoriesId.map(c => ({
      category_id: c,
      budget_id: budget.id,
    }));

    await database('budget_categories').insert(formattedCategoriesId);

    return response.status(201).end();
  }

  async function update(request, response) {
    const bodySchema = yup.object().shape({
      categoriesId: yup.array().of(yup.number().positive()),
      name: yup.string(),
      amountTotal: yup.number().positive(),
      description: yup.string(),
    });

    const { name, description, amountTotal } = request.body;

    if (!name && !description && !amountTotal) {
      return response.status(400).json({
        message: 'Error: Empty body',
      });
    }

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id } = request.params;

    const budget = await database('budget').where({ id }).select('*').first();

    if (!budget) {
      return response.status(404).json({
        message: 'Budget not found',
      });
    }

    const { categoriesId } = request.body;

    if (categoriesId && categoriesId.length > 0) {
      const formattedCategoriesId = categoriesId.map(c => ({
        category_id: c,
        budget_id: id,
      }));

      await database('budget_categories').where({ budget_id: id }).del();
      await database('budget_categories').insert(formattedCategoriesId);
    }

    await database('budget')
      .update({
        name,
        description,
        amount_total: amountTotal,
      })
      .where({ id });

    return response.status(200).end();
  }

  async function show(request, response) {
    const { id } = request.params;
    const budget = await database('budget').where({ id }).select('*').first();
    if (!budget) {
      return response.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await database('wallet')
      .where({ id: budget.wallet_id })
      .select('*')
      .first();

    const { id: userId } = request.userData;
    if (wallet.user_id !== userId) {
      return response.status(401).json({
        message: 'This budget is not yours',
      });
    }

    return response.status(200).json({ ...budget });
  }

  async function index(request, response) {
    const { id: userId } = request.userData;
    let wallets = await database('wallet')
      .where({ user_id: userId })
      .select('id');
    wallets = wallets.map(i => i.id);

    const budgets = await database('budget')
      .whereIn('wallet_id', wallets)
      .select('*');

    return response.status(200).json({ budgets });
  }

  return {
    store,
    update,
    show,
    index,
  };
}

module.exports = BudgetsController;
