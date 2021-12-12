import axios from "axios";
import { DocumentNode, print } from "graphql";
import gql from "graphql-tag";
import { IAccessTokens, useJwtToken } from "./useJwtToken";

const GraphQLUrl = process.env.GRAPHQL_URL as string;

interface IGraphQLQuery {
  query: DocumentNode,
  variables?: Record<string, unknown>,
}

interface IGraphQLMutation {
  mutation: DocumentNode,
  variables?: Record<string, unknown>,
}

export const useGraphQL = (accessTokens: IAccessTokens) => {
  const authHeaders = { Authorization: useJwtToken(accessTokens) };
  const client = new GraphQLClient(GraphQLUrl, authHeaders);

  return {
    client,
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