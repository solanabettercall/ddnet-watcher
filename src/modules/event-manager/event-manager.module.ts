import { Module } from '@nestjs/common';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';
import { EventStorageModule } from '../event-storage/event-storage.module';
import { EventListenerService } from './event-listener.service';

@Module({
  imports: [TelegramBotModule, EventStorageModule],
  providers: [EventListenerService],
  exports: [EventListenerService],
})
export class EventManagerModule {}
