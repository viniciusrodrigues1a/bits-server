import { IQueue, IQueueObject } from './IQueue';
import Queue from 'bull';

export const QueueMain = {
  queues: <{ [key: string]: IQueueObject }>{},
  createQueus(allQueues: IQueue[]) {
    allQueues.forEach(({ callbackOnFailure, queueName, jobHandler }) => {
      this.queues[queueName] = {
        queue: new Queue(queueName, 'redis://127.0.0.1:6379'),
        jobHandler,
        callbackOnFailure,
        queueName,
      };
    });
  },
  initQueues() {
    Object.keys(this.queues).forEach(name => {
      const { jobHandler, callbackOnFailure, queue } = this.queues[name];
      queue.process(jobHandler);
    });
  },

  addItemInQueue(queueName: string, item: any, queueConfig: Queue.JobOptions) {
    this.queues[queueName].queue.add(item, {});
  },
};
