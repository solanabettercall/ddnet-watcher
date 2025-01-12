export const kickWithReasonRegex =
  /^'(.+)' has left the game \(Kicked \((.+)\)\)$/;
export const kickWithoutReasonRegex =
  /^'(.+)' has left the game \(Kicked by console\)$/;

export const voteSpectateRegex =
  /^'(.+)' called for vote to move '(.+)' to spectators \((.+)\)$/;

export const voteKickRegex = /^'(.+)' called for vote to kick '(.+)' \((.+)\)$/;

export const banWithMinutesRegex =
  /^'(.+)' has left the game \(You have been banned for ([0-9]+) minute(?:s)? \((.+)\)\)$/;

export const permanentBanRegex =
  /^'(.+)' has left the game \(You have been banned \((.+)\)\)$/;

export const banWithUntilRegex =
  /^'(.+)' has left the game \(You have been banned \((.+)\. Until (.+)\)\)$/;
