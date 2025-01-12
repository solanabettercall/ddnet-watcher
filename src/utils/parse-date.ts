import * as moment from 'moment';

export const parseDate = (date: string): Date =>
  moment.utc(date, 'MMM DD HH:mm UTC').toDate();

export const parseDateFromMinutes = (minutes: number | string): Date => {
  const parsedMinutes =
    typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;

  if (isNaN(parsedMinutes)) {
    throw new Error(
      `Invalid input: ${minutes} is not a valid number or string.`,
    );
  }

  return moment().add(parsedMinutes, 'minutes').toDate();
};
