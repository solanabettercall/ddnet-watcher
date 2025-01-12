import { Module } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverManagerService } from './observer-manager.service';

import { ObserverFactoryService } from './observer-factory.service';
import { BullModule } from '@nestjs/bull';
import { EVENTS_QUEUE } from './consts';
import { EventsProcessor } from './processors/events.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: EVENTS_QUEUE,
    }),
  ],
  providers: [
    ObserverService,
    ObserverManagerService,
    ObserverFactoryService,
    EventsProcessor,
  ],
  exports: [ObserverManagerService],
})
export class ObserverModule {}
