const yup = require('yup');
const { CronJobsHandler } = require('../cronJobsHandler');

function ScheduledTransactionController(database) {
  async function store(request, response) {
    const bodySchema = yup.object().shape({
      categoriesId: yup.array().of(yup.number().positive()).required(),
      walletId: yup.number().positive().required(),
      amount: yup.number().positive().required(),
      timesToRepeat: yup.number().positive().required(),
      type: yup.string().required(),
      timeSpan: yup.number().positive().required(),
      description: yup.string(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const {
      categoriesId,
      walletId,
      timeSpan,
      timesToRepeat,
      amount,
      description,
      type,
    } = request.body;

    if (timeSpan > timesToRepeat) {
      return response.status(400).json({
        message: "Time span doesn't coincide with times to repeat",
      });
    }
    const wallet = await database('wallet')
      .where({ id: walletId })
      .select('*')
      .first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    const category = await database('category')
      .whereIn('id', categoriesId)
      .select('*')
      .first();

    if (!category) {
      return response.status(404).json({
        message: 'Category not exist!',
      });
    }

    console.log('****CATEGORY***', category);

    const cronExpression = formatCronExpression(type, timeSpan);

    const data = {
      wallet_id: walletId,
      cron_expression: cronExpression,
      time_span: timeSpan,
      times_to_repeat: timesToRepeat,
      amount,
      description,
      type,
    };

    const scheduledTransaction = await createScheduledTransaction(
      data,
      categoriesId
    );

    return response.status(201).json(scheduledTransaction);
  }

  function formatCronExpression(type, timeSpan) {
    let cronExpression;

    if (type.toLowerCase() === 'month') {
      const dayOfMonth = new Date().getDate();
      cronExpression = `00 00 ${dayOfMonth} */${timeSpan} *`;
    } else if (type.toLowerCase() === 'week') {
      const dayOfWeek = new Date().getDay();
      cronExpression = `00 00 */${timeSpan}  * ${dayOfWeek}`;
    } else if (type.toLowerCase() === 'day') {
      cronExpression = `00 00 */${timeSpan} * *`;
    } else if (type.toLowerCase() === 'minute') {
      cronExpression = `*/${timeSpan} * * * *`;
    }

    return cronExpression;
  }
  async function destroy(request, response) {
    const { id } = request.params;

    const transaction = await database('scheduled_transaction')
      .where({ id })
      .select('*')
      .first();

    if (!transaction) {
      return response.status(404).json({
        message: 'Transaction not found',
      });
    }

    await database('scheduled_transaction_category')
      .where({ scheduled_transaction_id: id })
      .del();
    await database('scheduled_transaction').where({ id }).del();

    return response.status(204).end();
  }

  async function update(request, response) {
    const bodySchema = yup.object().shape({
      categoriesId: yup.array().of(yup.number().positive()),
      walletId: yup.number().positive(),
      amount: yup.number().positive(),
      timesToRepeat: yup.number().positive(),
      type: yup.string(),
      timeSpan: yup.number().positive(),
      description: yup.string(),
    });

    if (!(await bodySchema.isValid(request.body))) {
      return response.status(400).json({ message: 'Validation failed!' });
    }

    const { id } = request.params;

    const transaction = await database('scheduled_transaction')
      .where({ id })
      .select('*')
      .first();

    if (!transaction) {
      return response.status(404).json({
        message: 'Transaction not found',
      });
    }

    const {
      categoriesId,
      walletId,
      timeSpan,
      timesToRepeat,
      amount,
      description,
      type,
    } = request.body;

    const wallet = await database('wallet')
      .where({ id: walletId || transaction.wallet_id })
      .select('*')
      .first();

    if (!wallet) {
      return response.status(404).json({
        message: 'Wallet not found',
      });
    }

    let cronExpression;

    if (type && timeSpan) {
      cronExpression = formatCronExpression(type, timeSpan);
    }

    const data = {
      wallet_id: walletId,
      cron_expression: cronExpression,
      time_span: timeSpan,
      times_to_repeat: timesToRepeat,
      amount,
      description,
      type,
    };

    if (categoriesId) {
      await database('scheduled_transaction_category')
        .where({ scheduled_transaction_id: id })
        .del();
      insertCategories(transaction.id, categoriesId);
    }

    const [updatedTransaction] = await database('scheduled_transaction')
      .where({ id })
      .update(data)
      .returning('*');

    return response.status(201).json(updatedTransaction);
  }

  async function index(request, response) {
    const { id: userId } = request.userData;

    const transactions = await database('scheduled_transaction')
      .join('wallet', 'scheduled_transaction.wallet_id', '=', 'wallet.id')
      .where('wallet.user_id', userId)
      .select('scheduled_transaction.*');

    return response.status(200).json({ transactions });
  }

  async function show(request, response) {
    const { userId } = request.userData;
    const { id } = request.params;

    const transaction = await database('scheduled_transaction')
      .where({ id })
      .select('*')
      .first();

    if (!transaction) {
      return response.status(404).json({
        message: 'Transaction not found',
      });
    }

    const wallet = await database('wallet').where({
      id: transaction.id,
    });

    if (wallet.user_id !== userId) {
      return response.status(401).json({
        message: 'This wallet is not yours',
      });
    }

    return response.status(200).json(transaction);
  }

  async function createScheduledTransaction(data, categoriesId) {
    const [scheduledTransaction] = await database('scheduled_transaction')
      .insert(data)
      .returning('*');

    insertCategories(scheduledTransaction.id, categoriesId);

    const cronJob = new CronJobsHandler(database).createNewJob(
      scheduledTransaction
    );

    const [updatedScheduledTransaction] = await database(
      'scheduled_transaction'
    )
      .where({ id: scheduledTransaction.id })
      .update({
        due_date: cronJob.nextDate(),
      })
      .returning('*');

    return updatedScheduledTransaction;
  }

  async function insertCategories(scheduledTransactionId, categoriesId) {
    const formattedCategoriesId = categoriesId.map(id => {
      const object = {
        category_id: id,
        scheduled_transaction_id: scheduledTransactionId,
      };

      return object;
    });
    console.log('formated', formattedCategoriesId);
    await database('scheduled_transaction_category').insert(
      formattedCategoriesId
    );
  }

  return {
    store,
    destroy,
    update,
    index,
    show,
  };
}

module.exports = ScheduledTransactionController;
