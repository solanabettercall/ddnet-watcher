import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Ban } from './entities/ban.entity';
import { Kick } from './entities/kick.entity';
import { Vote } from './entities/vote.entity';
import { Player } from './entities/player.entity';
import { Server } from './entities/server.entity';
import { Address } from './entities/address.entity';
import { MapInfo } from './entities/map.entity';
import { Clan } from './entities/clan.entity';
import { IVoteFullInfo } from './dto/vote-full-info.dto';

@Injectable()
export class EventStorageService implements OnApplicationBootstrap {
  async getVoteFull(id: string): Promise<IVoteFullInfo> {
    const result = await this.voteRepository
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.voter', 'voter')
      .leftJoinAndSelect('vote.target', 'target')
      .leftJoinAndSelect('vote.server', 'server')
      .leftJoinAndSelect('voter.clan', 'voterClan')
      .leftJoinAndSelect('target.clan', 'targetClan')
      .leftJoinAndSelect('server.address', 'address')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Vote, 'v')
          .where('v.voter_id = vote.voter_id')
          .andWhere("v.created_at > NOW() - INTERVAL '1 HOUR'");
      }, 'votes_last_hour')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Vote, 'v')
          .where('v.voter_id = vote.voter_id')
          .andWhere("v.created_at > NOW() - INTERVAL '1 DAY'");
      }, 'votes_last_day')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Vote, 'v')
          .where('v.voter_id = vote.voter_id');
      }, 'votes_all_time')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Vote, 'v')
          .where('v.target_id = vote.target_id')
          .andWhere("v.created_at > NOW() - INTERVAL '1 HOUR'");
      }, 'target_votes_last_hour')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Vote, 'v')
          .where('v.target_id = vote.target_id')
          .andWhere("v.created_at > NOW() - INTERVAL '1 DAY'");
      }, 'target_votes_last_day')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Vote, 'v')
          .where('v.target_id = vote.target_id');
      }, 'target_votes_all_time')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'ban_count')
          .from(Ban, 'b')
          .where('b.player_id = vote.voter_id');
      }, 'voter_ban_count')
      .addSelect((subQuery) => {
        return subQuery
          .select(
            'ROUND(SUM(EXTRACT(EPOCH FROM (b.until - b.created_at))) / 3600.0, 2)',
            'ban_duration_hours',
          )
          .from(Ban, 'b')
          .where('b.player_id = vote.voter_id');
      }, 'voter_ban_duration')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'ban_count')
          .from(Ban, 'b')
          .where('b.player_id = vote.target_id');
      }, 'target_ban_count')
      .addSelect((subQuery) => {
        return subQuery
          .select(
            'ROUND(SUM(EXTRACT(EPOCH FROM (b.until - b.created_at))) / 3600.0, 2)',
            'ban_duration_hours',
          )
          .from(Ban, 'b')
          .where('b.player_id = vote.target_id');
      }, 'target_ban_duration')
      .where('vote.id = :id', { id })
      .getRawAndEntities();

    if (!result || !result.entities || result.entities.length === 0) {
      throw new Error(`Vote with id ${id} not found`);
    }

    const vote = result.entities[0];
    const raw = result.raw[0];

    const voter = vote.voter;
    const target = vote.target;

    return {
      ...vote,
      voter: {
        ...voter,
        numberOfVotes: {
          lastHour: parseInt(raw.votes_last_hour, 10),
          lastDay: parseInt(raw.votes_last_day, 10),
          allTime: parseInt(raw.votes_all_time, 10),
        },
        totalBanCount: parseInt(raw.voter_ban_count, 10),
        totalBanDuration: parseFloat(raw.voter_ban_duration) || 0, // Если значение null, возвращается 0
      },
      target: target
        ? {
            ...target,
            numberOfVotes: {
              lastHour: parseInt(raw.target_votes_last_hour, 10),
              lastDay: parseInt(raw.target_votes_last_day, 10),
              allTime: parseInt(raw.target_votes_all_time, 10),
            },
            totalBanCount: parseInt(raw.target_ban_count, 10),
            totalBanDuration: parseFloat(raw.target_ban_duration) || 0, // Если значение null, возвращается 0
          }
        : undefined,
    };
  }

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

  async onApplicationBootstrap() {}

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
    return this.voteRepository.save<Vote>(vote);
  }

  async saveKick(kick: Kick) {
    kick.target = await this.findOrCreatePlayer(kick.target);
    kick.server = await this.findOrCreateServer(kick.server);

    return this.kickRepository.save<Kick>(kick);
  }

  private async findOrCreatePlayer(player: Player): Promise<Player> {
    const clan: Clan | null = await this.findOrCreateClan(player?.clan?.name);

    let existingPlayer = await this.playerRepository.findOne({
      where: { name: player.name, clan: { id: clan ? clan.id : IsNull() } },
    });

    if (!existingPlayer) {
      existingPlayer = this.playerRepository.create({
        ...player,
        clan: clan,
      });
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

  async getLastVotes(): Promise<Vote[]> {
    return this.voteRepository.find({
      take: 10,
      skip: 0,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        server: true,
      },
    });
  }
}
