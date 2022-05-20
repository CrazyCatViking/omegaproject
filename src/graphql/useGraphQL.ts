import axios from "axios";
import ws from 'ws';
import { createClient } from 'graphql-ws';
import { DocumentNode, print } from "graphql";
import { IAccessTokens, useJwtToken } from "./useJwtToken";
import { decode } from '../utility/hashids';

const GraphQLUrl = process.env.OMEGAQL_URL as string;
const GraphQLWSUrl = process.env.OMEGAQL_WS_URL as string;

interface IGraphQLQuery {
  query: DocumentNode,
  variables?: Record<string, unknown>,
}

interface IGraphQLMutation {
  mutation: DocumentNode,
  variables?: Record<string, unknown>,
}

export const useGraphQL = (accessTokens: IAccessTokens) => {
  const authHeaders = { authorization: useJwtToken({
    ...accessTokens,
    guildContext: accessTokens.guildContext ? 
      decode(accessTokens.guildContext)[0].toString() : 
      undefined,
  }) };

  const client = new GraphQLClient(GraphQLUrl, authHeaders);

  const wsClient = createClient({
    url: GraphQLWSUrl,
    webSocketImpl: ws,
    connectionParams: () => ({ headers: authHeaders }),
  });

  return {
    client,
    wsClient,
  }
}

export class GraphQLClient {
  private graphQLUrl: string;
  private authHeaders: Record<string, string>

  constructor(graphQLUrl: string, authHeaders: Record<string, string>) {
    this.graphQLUrl = graphQLUrl;
    this.authHeaders = authHeaders;
  }

  public async query({ query, variables }: IGraphQLQuery) {
    try {
      const res = await axios({
        url: this.graphQLUrl,
        method: 'post',
        data: {
          query: print(query),
          variables,
        },
        headers: this.authHeaders,
      });

      return res.data;
    } catch (error: any) {
      console.error(error.response.data)
      return null;
    }
  }

  public async mutation({ mutation, variables }: IGraphQLMutation) {
    try {
      const res = await axios({
        url: this.graphQLUrl,
        method: 'post',
        data: {
          query: print(mutation),
          variables,
        },
        headers: this.authHeaders,
      });
      
      return res.data;
    } catch (error: any) {
      console.error(error.response.data)
      return null;
    }
  }
}