import { Global, Module } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverManagerService } from './observer-manager.service';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [],
  providers: [ObserverService, ObserverManagerService],
  exports: [ObserverManagerService],
})
export class ObserverModule {}
