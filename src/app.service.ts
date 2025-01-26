import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ObserverService } from './modules/observer/observer.service';
import { ObserverManagerService } from './modules/observer/observer-manager.service';
import { ObserverServiceConfigDto } from './modules/observer/dto/observer-service-config.dto';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly observerManagerService: ObserverManagerService,
  ) {}

  async onApplicationBootstrap() {
    await this.observerManagerService.addObserver({
      botName: 'rock',
      address: {
        host: '176.98.40.225',
        port: 8303,
      },
    });
    // await this.observerManagerService.addObserver({
    //   botName: 'rock',
    //   address: {
    //     host: '65.109.48.114',
    //     port: 8570,
    //   },
    // });
    // await this.observerManagerService.addObserver({
    //   botName: 'rock',
    //   address: {
    //     host: '91.206.15.2',
    //     port: 8306,
    //   },
    // });
    // await this.observerManagerService.addObserver({
    //   botName: 'rock',
    //   address: {
    //     host: '91.206.15.2',
    //     port: 8377,
    //   },
    // });
    // await this.observerManagerService.addObserver({
    //   botName: 'rock',
    //   address: {
    //     host: '91.206.15.2',
    //     port: 8367,
    //   },
    // });
    // await this.observerManagerService.addObserver({
    //   botName: 'rock',
    //   address: {
    //     host: '65.109.48.114',
    //     port: 8427,
    //   },
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
