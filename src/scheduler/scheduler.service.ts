import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ObserverManagerService } from 'src/observer/observer-manager.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly observerManagerService: ObserverManagerService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'reconnectDisconnected',
    disabled: true,
  })
  async reconnectDisconnected() {
    await this.observerManagerService.reconnectDisconnected();
  }
}
