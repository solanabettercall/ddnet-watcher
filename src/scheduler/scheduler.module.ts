import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ObserverModule } from 'src/observer/observer.module';

@Module({
  imports: [ScheduleModule.forRoot(), ObserverModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
