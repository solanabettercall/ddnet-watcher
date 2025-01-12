import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObserverModule } from './observer/observer.module';
import { ObserverManagerService } from './observer/observer-manager.service';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [ObserverModule, SchedulerModule],
  controllers: [AppController],
  providers: [AppService, ObserverManagerService],
})
export class AppModule {}
