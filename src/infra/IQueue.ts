import { Job, Queue } from 'bull';

export interface IQueue {
  queueName: string;
  jobHandler: (job: Job) => void;
  callbackOnFailure: () => void;
}

export interface IQueueObject extends IQueue {
  queue: Queue;
}
