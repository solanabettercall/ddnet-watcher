import { Controller, Get } from '@nestjs/common';
import { EventStorageService } from './event-storage.service';
import { Vote } from './entities/vote.entity';

@Controller('api')
export class EventStorageController {
  constructor(private readonly eventStorageService: EventStorageService) {}

  @Get('votes')
  async getVotes(): Promise<Vote[]> {
    return this.eventStorageService.getLastVotes();
  }
}
