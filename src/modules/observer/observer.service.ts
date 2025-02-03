import { Logger } from '@nestjs/common';
import { ObserverServiceConfigDto } from './dto/observer-service-config.dto';
import { Client, IMessage } from 'src/lib/client';
import {
  banWithUntilRegex,
  banWithMinutesRegex,
  kickWithoutReasonRegex,
  kickWithReasonRegex,
  permanentBanRegex,
  voteKickRegex as voteBanRegex,
  voteSpectateRegex,
  voteChangeOptionRegex,
  playerJoinRegex,
} from './regex';
import { parseDate, parseDateFromMinutes } from 'src/utils/parse-date';
import { BanEventDto } from './dto/events/ban-event.dto';
import { VoteResultEventDto } from './dto/events/vote-result-event.dto';
import { VoteEventDto } from './dto/events/vote-event.dto';
import { VoteType } from './interfaces/vote-event.interface';
import { KickEventDto } from './dto/events/kick-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDebouncer } from './event-debouncer';
import { DeltaItem, SnapshotItemTypes } from 'src/lib/enums_types/types';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { Player } from '../event-storage/entities/player.entity';
import { JoinEventDto } from './dto/events/join-event.dto';
import { LeaveEventDto } from './dto/events/leave-event.dto';
import { SnapshotItemIDs } from 'src/lib/enums_types/protocol';
import { PlayerUpdateEventDto } from './dto/events/player-update-event.dto';
import { hashString } from 'src/utils/hast-string';

export class ObserverService {
  private readonly logger: Logger;
  private readonly debouncer: EventDebouncer;

  private client: Client;
  private connected = false;

  private readonly getServerName = () =>
    `${this.config.server.address.host}:${this.config.server.address.port}`;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    public readonly config: ObserverServiceConfigDto,
    private readonly serverDiscoveryCacheService: ServerDiscoveryCacheService,
  ) {
    this.debouncer = new EventDebouncer();
    if (!this.config) return;
    this.client = new Client(
      this.config.server.address.host,
      this.config.server.address.port,
      this.config.botName,
      {
        identity: {
          name: this.config.botName,
          clan: '',
          country: -1,
          skin: this.config.skin,
          use_custom_color: 0,
          color_body: 10346103,
          color_feet: 65535,
          id: 0,
        },
      },
    );
    this.logger = new Logger(this.getServerName());
    this.registerEventHandlers();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  private previousPlayers: Map<number, Player> = new Map();

  private registerEventHandlers(): void {
    this.client.on('connected', async () => {
      this.logger.log(`Бот ${this.config.botName} подключен`);

      for (const { id, name, clan } of this.client.SnapshotUnpacker
        .AllObjClientInfo) {
        const player = new Player(name, clan);
        this.previousPlayers.set(id, player);
        await this.serverDiscoveryCacheService.cachePlayer(
          this.config.server.address,
          player,
          0,
        );
      }
      this.connected = true;
      this.client.game.SetTeam(-1);
    });

    this.client.on('map_details', async (map_details) => {
      this.config.server.map.name = map_details.map_name;
      const serverKey = hashString(JSON.stringify(this.config.server));
      this.debouncer.emit(serverKey, undefined, async () => {
        await this.serverDiscoveryCacheService.сacheServer(
          this.config.server,
          0,
        );
      });
    });

    this.client.on('snapshot', async (items: DeltaItem[]) => {
      if (!this.connected) return;

      const parsedItems = items
        .filter((item) => item.type_id === SnapshotItemIDs.OBJ_CLIENT_INFO)
        .map(
          (filteredItem) => filteredItem.parsed as SnapshotItemTypes.ClientInfo,
        );

      if (parsedItems.length <= 0) return;

      const currentPlayers = new Map<number, Player>();

      for (const { id, name, clan } of parsedItems) {
        const newPlayer = new Player(name, clan);

        // Получаем старого игрока из предыдущего состояния
        const oldPlayer = this.previousPlayers.get(id);

        if (oldPlayer) {
          // Проверяем изменения игрока
          if (!oldPlayer.equals(newPlayer)) {
            const event = new PlayerUpdateEventDto(this.config.server, {
              oldPlayer,
              newPlayer,
            });

            const eventKey = hashString(event.toString());
            this.debouncer.emit(eventKey, event, (event) => {
              this.eventEmitter.emit('player.update', event);
            });

            // Устанавливаем TTL для старого игрока, если изменилось имя
            if (oldPlayer.name !== newPlayer.name) {
              await this.serverDiscoveryCacheService.updatePlayerTTL(
                this.config.server.address,
                oldPlayer.name,
                60,
              );
            }

            // Кэшируем обновлённого игрока
            await this.serverDiscoveryCacheService.cachePlayer(
              this.config.server.address,
              newPlayer,
              0,
            );
          }
        } else {
          // Если игрок новый, кэшируем его и создаём событие входа
          await this.serverDiscoveryCacheService.cachePlayer(
            this.config.server.address,
            newPlayer,
            0,
          );

          const joinEvent = new JoinEventDto(
            { ...this.config.server },
            { target: newPlayer },
          );
          const eventKey = hashString(joinEvent.toString());
          this.debouncer.emit(eventKey, joinEvent, (joinEvent) => {
            this.eventEmitter.emit('join', joinEvent);
          });
        }

        currentPlayers.set(id, newPlayer);
      }

      // Обработка вышедших игроков
      for (const [id, player] of this.previousPlayers) {
        if (!currentPlayers.has(id)) {
          const leaveEvent = new LeaveEventDto(
            { ...this.config.server },
            { target: player },
          );
          const eventKey = hashString(leaveEvent.toString());
          this.debouncer.emit(eventKey, leaveEvent, (leaveEvent) => {
            this.eventEmitter.emit('leave', leaveEvent);
          });

          // Устанавливаем TTL для вышедшего игрока

          this.debouncer.emit(eventKey, null, async () => {
            await this.serverDiscoveryCacheService.updatePlayerTTL(
              this.config.server.address,
              player.name,
              60,
            );
          });
        }
      }

      // Обновляем состояние
      this.previousPlayers = currentPlayers;
    });

    this.client.on('message', async (message: IMessage) => {
      if (!this.connected) return;
      const eventKey = hashString(message.toString());

      const { message: text } = message;
      const clientId = message?.client_id;
      if (clientId === -1) {
        if (await this.handleKickWithReason(text)) return;
        if (await this.handleKickWithoutReason(text)) return;
        if (await this.handleVoteSpectate(text)) return;
        if (await this.handleVoteBan(text)) return;
        if (await this.handleVoteChangeOption(text)) return;
        if (this.handleVotePassed(text)) return;
        if (this.handleVoteFailed(text)) return;
        if (await this.handleBanUntil(text)) return;
        if (await this.handleBanWithMinutes(text)) return;
        if (await this.handlePermanentBan(text)) return;
        if (await this.handlePlayerJoin(text)) return;
        if (await this.handlePlayerLeave(text)) return;

        this.debouncer.emit(eventKey, message, (event) => {
          this.eventEmitter.emit('chat.message.system', event);
        });
      } else {
        this.debouncer.emit(eventKey, message, (event) => {
          this.eventEmitter.emit('chat.message.player', event);
        });
      }
    });

    this.client.on('map_details', (message) => {
      this.config.server.map.name = message.map_name;
    });

    this.client.on('disconnect', (reason: string) => {
      if (!this.connected) return;
      this.logger.warn(`Бот ${this.config.botName} отключен: ${reason}`);
      this.connected = false;
    });
  }

  async handlePlayerJoin(text: string) {
    const playerJoin = text.match(playerJoinRegex);
    if (playerJoin) {
      return true;
    }
    return false;
  }

  async handlePlayerLeave(text: string) {
    const playerJoin = text.match(playerJoinRegex);
    if (playerJoin) {
      return true;
    }
    return false;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.Disconnect();
    }
    await this.serverDiscoveryCacheService.clearCacheForServer(
      this.config.server.address,
    );
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  //#region Кик
  private async handleKickWithReason(text: string): Promise<boolean> {
    const kickWithReason = text.match(kickWithReasonRegex);
    if (kickWithReason) {
      const [, targetName, reason] = kickWithReason;

      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );

      const kickEvent = new KickEventDto(
        { ...this.config.server },
        {
          target,
          reason,
        },
      );
      const eventKey = hashString(kickEvent.toString());

      this.debouncer.emit(eventKey, kickEvent, (event) => {
        this.eventEmitter.emit('kick', event);
      });

      return true;
    }
    return false;
  }

  private async handleKickWithoutReason(text: string): Promise<boolean> {
    const kickWithoutReason = text.match(kickWithoutReasonRegex);
    if (kickWithoutReason) {
      const [, targetName] = kickWithoutReason;
      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );

      const kickEvent = new KickEventDto(this.config.server, {
        target,
        reason: null,
      });
      const eventKey = hashString(kickEvent.toString());
      this.debouncer.emit(eventKey, kickEvent, (event) => {
        this.eventEmitter.emit('kick', event);
      });
      return true;
    }
    return false;
  }
  //#endregion

  //#region Голосования
  private async handleVoteSpectate(text: string): Promise<boolean> {
    const voteSpectate = text.match(voteSpectateRegex);
    if (voteSpectate) {
      const [, voterName, targetName, reason] = voteSpectate;
      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );
      const voter = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        voterName,
      );

      if (!voter || !target) {
        this.logger.warn(
          'Не удалось обработать событие голосования за перевод в наблюдатели',
          {
            text,
            target,
            targetName,
            voter,
            voterName,
            address,
          },
        );
        return;
      }

      const voteEvent = new VoteEventDto(this.config.server, {
        target,
        voter,
        reason,
        type: VoteType.Spectate,
      });

      const eventKey = hashString(voteEvent.toString());
      this.debouncer.emit(eventKey, voteEvent, (voteEvent) => {
        this.eventEmitter.emit('vote.spectate', voteEvent);
      });

      return true;
    }
    return false;
  }

  private async handleVoteBan(text: string): Promise<boolean> {
    const voteBan = text.match(voteBanRegex);
    if (voteBan) {
      const [, voterName, targetName, reason] = voteBan;
      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );
      const voter = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        voterName,
      );

      if (!voter || !target) {
        this.logger.warn(
          'Не удалось обработать событие голосования за перевод в наблюдатели',
          {
            text,
            target,
            targetName,
            voter,
            voterName,
            address,
          },
        );
        return;
      }

      const voteEvent = new VoteEventDto(this.config.server, {
        target,
        voter,
        reason,
        type: VoteType.Ban,
      });

      const eventKey = hashString(voteEvent.toString());
      this.debouncer.emit(eventKey, voteEvent, (voteEvent) => {
        this.eventEmitter.emit('vote.ban', voteEvent);
      });

      return true;
    }
    return false;
  }

  private async handleVoteChangeOption(text: string): Promise<boolean> {
    const voteChangeOption = text.match(voteChangeOptionRegex);
    if (voteChangeOption) {
      const [, voterName, option, reason] = voteChangeOption;

      const address = this.config.server.address;

      const voter = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        voterName,
      );

      const voteEvent = new VoteEventDto(this.config.server, {
        option,
        voter,
        reason,
        type: VoteType.Option,
      });

      const eventKey = hashString(voteEvent.toString());
      this.debouncer.emit(eventKey, voteEvent, (voteEvent) => {
        this.eventEmitter.emit('vote.changeOption', voteEvent);
      });

      return true;
    }
    return false;
  }

  private handleVotePassed(text: string): boolean {
    if (text === 'Vote passed') {
      const voteResultEvent = new VoteResultEventDto(this.config.server, {
        success: true,
      });

      const eventKey = hashString(voteResultEvent.toString());
      this.debouncer.emit(eventKey, voteResultEvent, (voteResultEvent) => {
        this.eventEmitter.emit('vote.passed', voteResultEvent);
      });

      return true;
    }
    return false;
  }

  private handleVoteFailed(text: string): boolean {
    if (text === 'Vote failed' || text.includes('canceled their vote')) {
      const voteResultEvent = new VoteResultEventDto(this.config.server, {
        success: false,
      });

      const eventKey = hashString(voteResultEvent.toString());
      this.debouncer.emit(eventKey, voteResultEvent, (voteResultEvent) => {
        this.eventEmitter.emit('vote.failed', voteResultEvent);
      });

      return true;
    }
    return false;
  }
  //#endregion

  private async handleBanWithMinutes(text: string): Promise<boolean> {
    const banWithMinutes = text.match(banWithMinutesRegex);
    if (banWithMinutes) {
      const [, targetName, minutes, reason] = banWithMinutes;
      const until = parseDateFromMinutes(minutes);

      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );

      const banEvent = new BanEventDto(this.config.server, {
        reason,
        target,
        until,
      });

      const eventKey = hashString(banEvent.toString());
      this.debouncer.emit(eventKey, banEvent, (banEvent) => {
        this.eventEmitter.emit('ban', banEvent);
      });

      return true;
    }
    return false;
  }

  private async handlePermanentBan(text: string): Promise<boolean> {
    const permanentBan = text.match(permanentBanRegex);
    if (permanentBan) {
      const [, targetName, reason] = permanentBan;

      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );

      const banEvent = new BanEventDto(this.config.server, { reason, target });

      const eventKey = hashString(banEvent.toString());
      this.debouncer.emit(eventKey, banEvent, (banEvent) => {
        this.eventEmitter.emit('ban', banEvent);
      });

      return true;
    }
    return false;
  }

  private async handleBanUntil(text: string): Promise<boolean> {
    const banUntil = text.match(banWithUntilRegex);
    if (banUntil) {
      const [, targetName, reason, until] = banUntil;
      const parsedDate = parseDate(until);
      const address = this.config.server.address;

      const target = await this.serverDiscoveryCacheService.getCachedPlayer(
        address,
        targetName,
      );

      const banEvent = new BanEventDto(this.config.server, {
        reason,
        target,
        until: parsedDate,
      });

      const eventKey = hashString(banEvent.toString());
      this.debouncer.emit(eventKey, banEvent, (banEvent) => {
        this.eventEmitter.emit('ban', banEvent);
      });

      return true;
    }
    return false;
  }
}
