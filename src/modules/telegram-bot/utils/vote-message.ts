import { IVoteFullInfo } from 'src/modules/event-storage/dto/vote-full-info.dto';
import { VoteType } from 'src/modules/observer/interfaces/vote-event.interface';
import { getFormatedServerUrl } from './server-url';

export const formatVoteMessage = (vote: IVoteFullInfo): string => {
  const { host, port } = vote.server.address;
  const formatedServerUrl = getFormatedServerUrl(host, port);

  const voteTypeMap = {
    [VoteType.Option]: '🗳️ Выбор',
    [VoteType.Ban]: '🚫 Исключение',
    [VoteType.Spectate]: '👀 Наблюдение',
  };

  const voteType = voteTypeMap[vote.type] || '❓ Неизвестный тип';
  const serverUrl = `${vote.server.address.host}:${vote.server.address.port}`;

  const voterInfo = `
👤 <b>Проголосовавший:</b> ${vote.voter.name}${vote.voter.clan ? ` [🏷️ Клан: ${vote.voter.clan.name}]` : ''}
📊 Голоса: за час: ${vote.voter.numberOfVotes.lastHour}, за день: ${vote.voter.numberOfVotes.lastDay}, всего: ${vote.voter.numberOfVotes.allTime}
⛔ Баны: ${vote.voter.totalBanCount} (всего: ${vote.voter.totalBanDuration} часов)
  `.trim();

  const targetInfo = vote.target
    ? `
🎯 <b>Цель:</b> ${vote.target.name}${vote.target.clan ? ` [🏷️ Клан: ${vote.target.clan.name}]` : ''}
📊 Голоса: за час: ${vote.target.numberOfVotes.lastHour}, за день: ${vote.target.numberOfVotes.lastDay}, всего: ${vote.target.numberOfVotes.allTime}
⛔ Баны: ${vote.target.totalBanCount} (всего: ${vote.target.totalBanDuration} часов)
  `.trim()
    : '<b>🎯 Цель:</b> Нет данных о цели';

  return `
📢 <b>Голосование:</b> ${voteType}
❓ <b>Причина:</b> ${vote.reason || 'Не указана'}

${targetInfo}

${voterInfo}

${formatedServerUrl}
  `.trim();
};
