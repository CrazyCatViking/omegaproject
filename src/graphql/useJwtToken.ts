import jwt from 'jsonwebtoken';

const ClientSecret = process.env.CLIENT_SECRET as string;

export interface IAccessTokens {
  discordToken?: string,
  dbContext?: string,
}

export const useJwtToken = (payload: IAccessTokens) => {
  return jwt.sign(payload, ClientSecret);
}