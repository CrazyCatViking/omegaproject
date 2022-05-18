import { Client } from "graphql-ws";
import { BaseCommand } from "../../../baseComponents/baseCommand";
import { GraphQLClient, useGraphQL } from "../../../graphql/useGraphQL";
import { ICommandOptions, IExtensionCommand } from "../../../utility/types";

import { getTwitchStream, subscribe } from "../gql/twitchQueries";

export class TwitchCommand extends BaseCommand {
  client: GraphQLClient;
  wsClient: Client;

  constructor(options: ICommandOptions) {
    super(options);

    const { client, wsClient } = useGraphQL({ guildContext: this.$guildId });
    this.client = client;
    this.wsClient = wsClient;

    this.wsClient.subscribe({ query: subscribe }, {
      next: (value) => console.log(value),
      error: () => console.log('error'),
      complete: () => console.log('complete'),
    });
  }

  template(): IExtensionCommand {
    return {
      name: 'twitch',
      description: 'Twitch integration',
      subCommands : [
        {
          name: 'streams',
          description: 'Get streams',
          method: this.methods.getStreams,
        },
      ],
    };
  }

  private methods = {
    getStreams: async () => {
      const { data } = await this.client.query({
        query: getTwitchStream,
      });

      console.log(data);
    } 
  }
}