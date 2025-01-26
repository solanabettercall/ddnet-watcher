import * as crypto from 'crypto';

export const hashString = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex');
};
