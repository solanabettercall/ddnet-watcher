import { Injectable } from '@nestjs/common';

import { ObserverService } from './observer.service';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EVENTS_QUEUE } from './consts';

@Injectable()
export class ObserverFactoryService {
  constructor(@InjectQueue(EVENTS_QUEUE) private readonly eventsQueue: Queue) {}

  create(config: ObserverConfigDto): ObserverService {
    return new ObserverService(this.eventsQueue, config);
  }
}
