import { Player } from 'src/modules/event-storage/entities/player.entity';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { IBanEvent } from '../../interfaces/ban-event.interface';
import { IPlayerUpdateEvent } from '../../interfaces/player-update-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class PlayerUpdateEventDto
  extends BaseEventDto
  implements IPlayerUpdateEvent
{
  constructor(server: IServerContext, dto: IPlayerUpdateEvent) {
    super(server);
    Object.assign(this, dto);
  }
  oldPlayer: Player;
  newPlayer: Player;

  toString(): string {
    const changes: string[] = [];

    if (this.oldPlayer.name !== this.newPlayer.name) {
      changes.push(
        `ник с '${this.oldPlayer.name}' на '${this.newPlayer.name}'`,
      );
    }

    if (
      this.oldPlayer?.clan !== this.newPlayer?.clan &&
      this.newPlayer?.clan &&
      this.oldPlayer?.clan
    ) {
      changes.push(
        `клан с '${this.oldPlayer.clan.name}' на '${this.newPlayer.clan.name}'`,
      );
    }

    if (changes.length > 0) {
      return `Игрок обновлён: ${changes.join(' и ')}.`;
    }

    return 'Игрок не изменён.';
  }
}
