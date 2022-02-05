import { JobOptions } from 'bull';
import { QueueMain } from '../QueueMain';
import { ScheduledTransactionQueue } from './schedulet-transaction-queue';

function getQueuConfig(
  cronExpression: string,
  timesToRepeat: number
): JobOptions {
  return {
    repeat: {
      cron: cronExpression,
      limit: timesToRepeat,
    },
  };
}

const connection = require('../../database/connection');
export async function initScheduledTransaction() {
  const transactions = await connection('scheduled_transaction').select('*');

  for (const items of transactions) {
    console.log(items);
    QueueMain.addItemInQueue(
      ScheduledTransactionQueue.queueName,
      { id: items.id },
      getQueuConfig(items.cron_expression, items.timesToRepeat)
    );
  }
}
