import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Ban } from './entities/ban.entity';
import { Kick } from './entities/kick.entity';
import { Vote } from './entities/vote.entity';
import { BanEventDto } from '../observer/dto/events/ban-event.dto';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { Player } from './entities/player.entity';
import { VoteEventDto } from '../observer/dto/events/vote-event.dto';
import { Server } from './entities/server.entity';
import { Address } from './entities/address.entity';
import { MapInfo } from './entities/map.entity';
import { VoteType } from '../observer/interfaces/vote-event.interface';
import { Clan } from './entities/clan.entity';

@Injectable()
export class EventStorageService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(EventStorageService.name);

  constructor(
    @InjectRepository(Ban)
    private banRepository: Repository<Ban>,
    @InjectRepository(Kick)
    private kickRepository: Repository<Kick>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(Player)
    private playerRepository: Repository<Player>,

    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
  ) {}

  async onApplicationBootstrap() {
    // const map = await this.findOrCreateMap(new MapInfo('Tutorial'));
    // const address = await this.findOrCreateAddress(
    //   new Address('176.98.40.225', 8303),
    // );
    // const server = await this.findOrCreateServer(
    //   new Server({
    //     address,
    //     map,
    //     name: 'Unknown',
    //   }),
    // );
    // const target = await this.findOrCreatePlayer(new Player('aba', 'zzz4'));
    // const vote = new Vote({
    //   reason: null,
    //   type: VoteType.Spectate,
    //   target,
    //   voter: new Player('foo', 'z'),
    //   server,
    // });
    // return this.voteRepository.save<Vote>(vote);
  }

  async saveBan(ban: Ban) {
    console.log(ban);
    const target = await this.findOrCreatePlayer(ban.target);

    const server = await this.findOrCreateServer(ban.server);

    ban.target = target;
    ban.server = server;

    this.logger.debug('Сохранили голосование');
    return this.banRepository.save<Ban>(ban);
  }

  async saveVote(vote: Vote) {
    const voter = await this.findOrCreatePlayer(vote.voter);
    const server = await this.findOrCreateServer(vote.server);

    vote.voter = voter;
    if (vote.target) vote.target = await this.findOrCreatePlayer(vote.target);
    vote.server = server;

    this.logger.debug('Сохранили голосование');
    console.log(vote);
    return this.voteRepository.save<Vote>(vote);
  }

  async saveKick(dto: Kick) {}

  private async findOrCreatePlayer(player: Player): Promise<Player> {
    const clan: Clan | null = await this.findOrCreateClan(player?.clan?.name);

    console.log(clan);

    let existingPlayer = await this.playerRepository.findOne({
      where: { name: player.name, clan: { id: clan ? clan.id : IsNull() } },
    });
    console.log('existingPlayer', existingPlayer);

    if (!existingPlayer) {
      existingPlayer = this.playerRepository.create({
        ...player,
        clan: clan,
      });
      console.log('existingPlayer create', existingPlayer);
      await this.playerRepository.save(existingPlayer);
    }

    return existingPlayer;
  }

  private async findOrCreateServer(server: Server): Promise<Server> {
    const address = await this.findOrCreateAddress(server.address);
    const map = await this.findOrCreateMap(server.map);

    let existingServer = await this.serverRepository.findOne({
      where: {
        address: { id: address.id },
        map: { id: map.id },
      },
      relations: ['address', 'map'], // Убедитесь, что загружаются связанные сущности
    });

    if (!existingServer) {
      server.address = address;
      server.map = map;
      existingServer = this.serverRepository.create(server);
      await this.serverRepository.save(existingServer);
    }

    return existingServer;
  }

  private async findOrCreateAddress(address: Address): Promise<Address> {
    let existingAddress = await this.serverRepository.manager
      .getRepository(Address)
      .findOne({
        where: {
          host: address.host,
          port: address.port,
          scheme: address.scheme,
        },
      });

    if (!existingAddress) {
      existingAddress = this.serverRepository.manager
        .getRepository(Address)
        .create(address);
      await this.serverRepository.manager
        .getRepository(Address)
        .save(existingAddress);
    }

    return existingAddress;
  }

  private async findOrCreateMap(map: MapInfo): Promise<MapInfo> {
    let existingMap = await this.serverRepository.manager
      .getRepository(MapInfo)
      .findOne({ where: { name: map.name } });

    if (!existingMap) {
      existingMap = this.serverRepository.manager
        .getRepository(MapInfo)
        .create(map);
      await this.serverRepository.manager
        .getRepository(MapInfo)
        .save(existingMap);
    }

    return existingMap;
  }

  private async findOrCreateClan(
    clanName: string | null,
  ): Promise<Clan | null> {
    if (!clanName || clanName.trim() === '') {
      return null; // Если имя клана не указано, возвращаем null
    }

    let existingClan = await this.serverRepository.manager
      .getRepository(Clan)
      .findOne({ where: { name: clanName } });

    if (!existingClan) {
      existingClan = this.serverRepository.manager.getRepository(Clan).create({
        name: clanName,
      });
      await this.serverRepository.manager
        .getRepository(Clan)
        .save(existingClan);
    }

    return existingClan;
  }
}
