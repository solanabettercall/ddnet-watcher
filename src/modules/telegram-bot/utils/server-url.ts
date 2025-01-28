export const getServerUrl = (host: string, port: number) => {
  return `https://ddnet.org/connect-to/?addr=${host}:${port}`;
};

export const getFormatedServerUrl = (host: string, port: number) => {
  const serverUrl = getServerUrl(host, port);

  return `🌐 <b>Сервер:</b> <a href="${serverUrl}">${host}:${port}</a>`;
};
