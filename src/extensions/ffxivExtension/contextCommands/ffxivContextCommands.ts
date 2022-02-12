import { ContextMenuInteraction } from "discord.js";
import { BaseContextCommand } from "../../../baseComponents/baseContextCommand";
import { GraphQLClient, useGraphQL } from "../../../graphql/useGraphQL";
import { createDiscordEmbed } from "../../../helpers/createDiscordEmbed";
import { ApplicationCommandType, ICommandOptions, IExtensionContextCommand } from "../../../utility/types";
import { GET_FFXIV_CHARACTER_STATS } from "../gql/ffxivQueries";
import { renderCharacterStats } from "../imageRenderers/ffxivCharacterStats";

export class FFXIVContextCommands extends BaseContextCommand {
  client: GraphQLClient;

  constructor(options: ICommandOptions) {
    super(options);

    const { client } = useGraphQL({ guildContext: this.$guildId });
    this.client = client;
  }

  public template(): IExtensionContextCommand {
    return {
      name: 'FFXIV Character Stats',
      type: ApplicationCommandType.UserCommand,
      method: this.methods.stats,
    };
  }

  private methods = {
    stats: async (interaction: ContextMenuInteraction) => {
      const user = interaction.options.getUser('user');

      const variables = {
        input: {
          discordId: user?.id,
          data: 'MIMO',
        },
      };

      await interaction.deferReply();

      const { data: { getCharacter } } = await this.client.query({
        query: GET_FFXIV_CHARACTER_STATS,
        variables,
      });

      if (!getCharacter?.id) {
        const failedResponse = createDiscordEmbed('Found no character data');
        await interaction.editReply({ embeds: [failedResponse] });
        return;
      }

      const chrStatImage = await renderCharacterStats(getCharacter);
      interaction.editReply({ files: [chrStatImage] });
    },
  } 
}