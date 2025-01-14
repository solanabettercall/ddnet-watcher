import { Inject, Injectable } from '@nestjs/common';

import { ObserverService } from './observer.service';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ObserverFactoryService {
  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  create(config: ObserverConfigDto): ObserverService {
    return new ObserverService(this.eventEmitter, config);
  }
}
