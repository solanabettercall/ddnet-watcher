import { utc } from 'moment';

export const parseDate = (date: string): Date =>
  utc(date, 'MMM DD HH:mm UTC').toDate();
