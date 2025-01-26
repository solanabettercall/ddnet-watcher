import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { Vote } from '../event-storage/entities/vote.entity';
import { formatVoteMessage } from './utils/vote-message';
import { IVoteFullInfo } from '../event-storage/dto/vote-full-info.dto';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger: Logger = new Logger(TelegramBotService.name);

  private channelId = process.env.TELEGRAM_CHANNEL_ID;

  private bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  private isEnabled = false;

  async onModuleInit() {
    if (!this.channelId) {
      this.logger.warn('Не задан ID канала телеграм');
      return;
    }

    this.bot.start((ctx) => ctx.reply('Добро пожаловать!'));
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    this.bot.launch(() => {
      this.isEnabled = true;
    });
  }

  async sendVote(vote: IVoteFullInfo) {
    if (!this.isEnabled) return;

    const message = formatVoteMessage(vote);

    try {
      await this.bot.telegram.sendMessage(this.channelId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.warn('Ошибка при отправке сообщения:', error);
    }
  }
}
