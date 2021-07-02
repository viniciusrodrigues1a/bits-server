/* eslint-ignore-file */
const { CronJob } = require('cron');

class CronJobsHandler {
  constructor(connection) {
    this.connection = connection;
  }

  async initializeAll() {
    await this.setTransactions();
    this.registerCronJobs();
  }

  async setTransactions() {
    this.transactions = await this.getValidScheduledTransactions();
  }

  async getValidScheduledTransactions() {
    const scheduledTransactions = await this.connection(
      'scheduled_transaction'
    ).select('*');

    return scheduledTransactions;
  }

  registerCronJobs() {
    this.transactions.forEach(transaction => {
      this.createNewJob(transaction);
    });
  }

  createNewJob(transaction) {
    const cronJob = new CronJob({
      cronTime: transaction.cron_expression,
    });
    cronJob.fireOnTick = () => {
      this.jobHandler(transaction.id, cronJob);
    };
    cronJob.start();
    return cronJob;
  }

  async jobHandler(transactionId, cronJob) {
    const transaction = await this.connection('scheduled_transaction')
      .where({ id: transactionId })
      .select('*')
      .first();

    if (!transaction) {
      cronJob.stop();
    }

    if (transaction.times_to_repeat === transaction.times_repeated) {
      cronJob.stop();
      return;
    }

    try {
      await this.connection.transaction(async trx => {
        await trx('scheduled_transaction')
          .where({ id: transactionId })
          .update({
            times_repeated: transaction.times_repeated + 1,
            due_date: cronJob.nextDate(),
          });

        const wallet = await trx('wallet')
          .where({ id: transaction.wallet_id })
          .select('*')
          .first();

        await trx('wallet')
          .where({ id: transaction.wallet_id })
          .update({ balance: wallet.balance - transaction.amount });
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = { CronJobsHandler };
