import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EVENTS_QUEUE } from '../consts';
import { IMessage } from 'src/lib/client';

@Processor(EVENTS_QUEUE)
@Injectable()
export class EventsProcessor {
  private readonly logger = new Logger(EventsProcessor.name);

  constructor() {}

  @Process()
  async handleMessage(job: Job<IMessage>) {
    const { message } = job.data;
    this.logger.log(message);
  }
}
