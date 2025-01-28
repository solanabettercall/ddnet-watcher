import * as moment from 'moment';
import { IBanFullInfo } from 'src/modules/event-storage/dto/ban-full-info.dto';
import { getFormatedServerUrl, getServerUrl } from './server-url';

export const formatBanMessage = (ban: IBanFullInfo): string => {
  const { host, port } = ban.server.address;
  const formatedServerUrl = getFormatedServerUrl(host, port);

  // Форматирование длительности в HH:MM:SS
  const formatBanDuration = (until: Date): string => {
    const now = moment();
    const untilMoment = moment(until);

    if (untilMoment.isBefore(now)) return 'Истёк';

    const duration = moment.duration(untilMoment.diff(now));
    let hours = Math.floor(duration.asHours());
    let minutes = duration.minutes();
    let seconds = duration.seconds();

    // Округляем секунды в большую сторону
    if (seconds > 0) {
      minutes += 1;
      seconds = 0;
    }

    // Если минуты становятся больше 59, корректируем часы и минуты
    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const targetInfo = `
🎯 <b>Забаненный игрок:</b> ${ban.target.name}${ban.target.clan ? ` [🏷️ Клан: ${ban.target.clan.name}]` : ''}
📊 Голоса: за час: ${ban.target.numberOfVotes.lastHour}, за день: ${ban.target.numberOfVotes.lastDay}, всего: ${ban.target.numberOfVotes.allTime}
⛔ Баны: ${ban.target.totalBanCount} (всего: ${ban.target.totalBanDuration} часов)
  `.trim();

  const banInfo = `
🚫 <b>Бан:</b> ${ban.reason || 'Причина не указана'}
📅 <b>Действует до:</b> ${ban.until ? moment(ban.until).format('DD.MM.YYYY HH:mm') : 'Навсегда'}
⏳ <b>Длительность:</b> ${ban.until ? formatBanDuration(ban.until) : 'Навсегда'}
  `.trim();

  return `
📢 <b>Информация о бане:</b>

${targetInfo}

${banInfo}

${formatedServerUrl}
  `.trim();
};
