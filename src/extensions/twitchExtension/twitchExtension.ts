import { Client } from "graphql-ws";
import { useGraphQL } from "../../graphql/useGraphQL";
import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand } from "../../utility/types";
import { TwitchCommand } from "./commands/twitchCommand";
import { subscribe } from "./gql/twitchQueries";

export class TwitchExtension extends BaseExtension {
  name = 'twitchExtension';
  wsClient: Client;

  constructor(guildId: string) {
    super(guildId);

    const { wsClient } = useGraphQL({ guildContext: this.$guildId });

    this.wsClient = wsClient;

    this.wsClient.subscribe({ query: subscribe }, {
      next: (value) => console.log(value),
      error: () => console.log('error'),
      complete: () => console.log('complete'),
    });
  }

  // FIXME! This seems to spawn three instances of the commands
  commands(): IExtensionCommand[] {
    const twitchCommand = new TwitchCommand({  state: this.$state, guildId: this.$guildId });

    return [
      twitchCommand.command,
    ]
  }
}