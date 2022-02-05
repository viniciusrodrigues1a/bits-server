import { ScheduledTransactionQueue } from './scheduled-transaction/schedulet-transaction-queue';
import { QueueMain } from './QueueMain';
import { initScheduledTransaction } from './scheduled-transaction/scheduled-transaction-operations';

QueueMain.createQueus([ScheduledTransactionQueue]);
QueueMain.initQueues();

initScheduledTransaction();
