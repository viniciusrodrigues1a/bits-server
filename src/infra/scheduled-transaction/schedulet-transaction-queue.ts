import { Job } from 'bull';
import { IQueue } from 'infra/IQueue';
import Knex from 'knex';
const connection = require('../../database/connection.js') as Knex;

export const ScheduledTransactionQueue: IQueue = {
  jobHandler(job: Job) {
    const { data } = job;
    (async () => {
      const transaction = await connection('scheduled_transaction')
        .select('*')
        .where({ id: data.id });
    })();
  },
  queueName: 'ScheduledTransactionQueue',
  callbackOnFailure() {
    console.log('failure task');
  },
};

export async function getTransaction(transactionId: number) {
  const transaction = await connection('scheduled_transaction')
    .where({ id: transactionId })
    .select('*')
    .first();

  if (
    !transaction ||
    transaction.times_to_repeat === transaction.times_repeated
  ) {
    throw new Error('transaction already completed or not exist');
  }
  return transaction;
}
