import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { formatVoteMessage } from './utils/vote-message';
import { IVoteFullInfo } from '../event-storage/dto/vote-full-info.dto';
import { IBanFullInfo } from '../event-storage/dto/ban-full-info.dto';
import { formatBanMessage } from './utils/ban-message';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger: Logger = new Logger(TelegramBotService.name);

  private votesChannelId = process.env.TELEGRAM_VOTES_CHANNEL_ID;
  private bansChannelId = process.env.TELEGRAM_BANS_CHANNEL_ID;

  private bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  private isEnabled = false;

  async onModuleInit() {
    if (!this.votesChannelId || !this.bansChannelId) {
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
      await this.bot.telegram.sendMessage(this.votesChannelId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.warn('Ошибка при отправке сообщения:', error);
    }
  }

  async sendBan(ban: IBanFullInfo) {
    if (!this.isEnabled) return;

    const message = formatBanMessage(ban);

    try {
      await this.bot.telegram.sendMessage(this.bansChannelId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.warn('Ошибка при отправке сообщения:', error);
    }
  }
}
