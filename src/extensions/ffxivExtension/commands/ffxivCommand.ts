import { CommandInteraction } from "discord.js";
import { BaseCommand } from "../../../baseComponents/baseCommand";
import { GraphQLClient, useGraphQL } from "../../../graphql/useGraphQL";
import { createDiscordEmbed, IMessageEmbedOptions } from "../../../helpers/createDiscordEmbed";
import { 
    ICommandOptions, 
    IExtensionCommand, 
    IExtensionCommandOption, 
    OptionTypes 
} from "../../../utility/types";
import { FIND_FFXIV_CHARACTER, GET_FFXIV_CHARACTER_STATS, SET_FFXIV_CHARACTER } from "../gql/ffxivQueries";
import { renderCharacterStats } from "../imageRenderers/ffxivCharacterStats";

export class FFXIVCommand extends BaseCommand {
    client: GraphQLClient;

    constructor(options: ICommandOptions) {
        super(options);

        const { client } = useGraphQL({ dbContext: this.$guildId });
        this.client = client;
    }

    template(): IExtensionCommand {
        return {
            name: 'ffxiv',
            description: 'Link and get information on your linked ffxiv profile',
            subCommands: [
                {
                    name: 'iam',
                    description: 'Registers your ffxiv profile to your discord user',
                    method: this.methods.iam,
                    options: [ 
                        {
                            ...this.options.ffxivCharacter,
                            required: true,
                        },
                        {
                            ...this.options.ffxivServer,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'stats',
                    description: 'Shows the stats for the user or a specified ffxiv character',
                    method: this.methods.stats,
                    options: [
                        this.options.discordUser,
                        this.options.ffxivCharacter,
                        this.options.ffxivServer,
                    ]
                },
                // {
                //     name: 'gear',
                //     description: 'Shows the currently equiped gear for the user or a specified ffxiv charaver',
                //     method: this.methods.gear,
                //     options: [
                //         this.options.discordUser,
                //         this.options.ffxivCharacter,
                //         this.options.ffxivServer,
                //     ]
                // },
            ]
        }
    }

    private methods = {
        iam: async (interaction: CommandInteraction) => {
            const name = interaction.options.getString('ffxiv-character');
            const server = interaction.options.getString('ffxiv-server');
            const discordId = interaction.user.id;

            await interaction.deferReply();

            const variables = {
                name,
                server,
            };

            const { data: { findCharacter } } = await this.client.query({
                query: FIND_FFXIV_CHARACTER,
                variables,
            });


            // Maybe handle this on the backend?
            if (!findCharacter.items[0]) {
                const failedResponse = createDiscordEmbed(`Could not find character: ${name} on server: ${server}`);
                await interaction.editReply({ embeds: [failedResponse] });
                return;
            }

            if (findCharacter.totalCount > 1) {
                const failedResponse = createDiscordEmbed(`There were multiple results, please be more specific`);
                await interaction.editReply({ embeds: [failedResponse] });
                return;
            }

            const character = findCharacter.items[0];

            await this.client.mutation({
                mutation: SET_FFXIV_CHARACTER,
                variables: {
                    discordId,
                    ffxivId: character.id,
                },
            });

            const options: IMessageEmbedOptions = {
                thumbnail: character.avatar,
                description: 'Character has been registered to your discord profile',
            };

            const embed = createDiscordEmbed(character.name, options);
            await interaction.editReply({ embeds: [embed] });
        },
        stats: async (interaction: CommandInteraction) => {
            const user = interaction.options.getUser('discord-user');
            const ffxivChrName = interaction.options.getString('ffxiv-character');
            const ffxivServer = interaction.options.getString('ffxiv-server');

            let userId = user?.id;
            
            if (!userId && !ffxivChrName && !ffxivServer) {
                userId = interaction.user.id;
            }

            const variables = {
                input: {
                    discordId: userId,
                    name: ffxivChrName,
                    server: ffxivServer,
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
        gear: (interaction: CommandInteraction) => {
            const user = interaction.options.getUser('discord-user');
            const ffxivChrName = interaction.options.getString('ffxiv-character');
            const ffxivServer = interaction.options.getString('ffxiv-server');
        }
    }

    private options: {[option: string]: IExtensionCommandOption} = {
        discordUser: {
            type: OptionTypes.User,
            input: 'discord-user',
            description: 'A mentionable discord user'
        },
        ffxivCharacter: {
            type: OptionTypes.String,
            input: 'ffxiv-character',
            description: 'A ffxiv characters full name'
        },
        ffxivServer: {
            type: OptionTypes.String,
            input: 'ffxiv-server',
            description: 'A ffxiv server name'
        }
    }
}