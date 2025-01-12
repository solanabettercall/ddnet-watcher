import { Module } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverManagerService } from './observer-manager.service';

@Module({
  providers: [ObserverService, ObserverManagerService],
  exports: [ObserverManagerService],
})
export class ObserverModule {}
