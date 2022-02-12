import jwt from 'jsonwebtoken';

const ClientSecret = process.env.CLIENT_SECRET as string;

export interface IAccessTokens {
  discordBotToken?: string,
  guildContext?: string,
}

export const useJwtToken = (payload: IAccessTokens) => {
  return jwt.sign(payload, ClientSecret);
}