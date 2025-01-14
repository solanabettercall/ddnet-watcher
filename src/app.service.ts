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
    // await this.observerManagerService.addObserver({
    //   ip: '176.98.40.225',
    //   port: 8303,
    //   botName: 'rock',
    // });
    // await this.observerManagerService.addObserver({
    //   ip: '172.19.0.1',
    //   port: 8303,
    //   botName: 'rock',
    // });
  }

  getInfo(): string {
    return 'DDNet Watcher';
  }
}
