import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RawServer, ServersResponse } from './interfaces';
import { readFile } from 'fs/promises';

@Injectable()
export class ServerDiscoveryApiService {
  constructor(private readonly httpService: HttpService) {}

  private async fetchServersFromFile(
    filePath: string = 'servers.json',
  ): Promise<RawServer[]> {
    try {
      const data = await readFile(filePath, 'utf-8');
      const parsed: ServersResponse = JSON.parse(data);
      return parsed.servers;
    } catch (error) {
      console.error(`Error reading mock data from ${filePath}:`, error.message);
      throw new Error('Failed to read mock servers data');
    }
  }

  private async fetchServersFromApi(
    filePath: string = 'servers.json',
  ): Promise<RawServer[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ServersResponse>('ddnet/15/servers.json'),
      );
      return response.data.servers;
    } catch (error) {
      console.error('Error fetching servers:', error.message);
      throw new Error('Failed to fetch servers from API');
    }
  }

  public async fetchServers(): Promise<RawServer[]> {
    return this.fetchServersFromFile();
  }
}
