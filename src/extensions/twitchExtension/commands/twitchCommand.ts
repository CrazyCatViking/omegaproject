import { BaseCommand } from "../../../baseComponents/baseCommand";
import { GraphQLClient, useGraphQL } from "../../../graphql/useGraphQL";
import { ICommandOptions, IExtensionCommand } from "../../../utility/types";

import { getTwitchStream } from "../gql/twitchQueries";

export class TwitchCommand extends BaseCommand {
  client: GraphQLClient;

  constructor(options: ICommandOptions) {
    super(options);

    const { client } = useGraphQL({ guildContext: this.$guildId });
    this.client = client;
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