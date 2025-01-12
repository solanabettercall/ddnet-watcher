import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ObserverService } from './observer/observer.service';
import { ObserverManagerService } from './observer/observer-manager.service';
import { ObserverConfigDto } from './observer/dto/observer-config.dto';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly observerManagerService: ObserverManagerService,
  ) {}

  async onApplicationBootstrap() {
    const config: ObserverConfigDto = {
      ip: '172.19.0.1',
      port: 8303,
      botName: 'rock',
    };
    await this.observerManagerService.addObserver(config);
    // await this.observerManagerService.addObserver(config);
    // await this.observerManagerService.addObserver({
    //   ip: '172.19.0.1',
    //   port: 8304,
    //   botName: 'rock2',
    // });
  }

  getInfo(): string {
    return 'DDNet Watcher';
  }
}
