import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObserverModule } from './observer/observer.module';
import { ObserverManagerService } from './observer/observer-manager.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ObserverModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
