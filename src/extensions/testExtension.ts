import { CommandInteraction } from "discord.js";
import { BaseExtension } from "../baseExtension";
import { IExtensionCommand, OptionTypes } from "../utility/types";

export class TestExtension extends BaseExtension {
    name: string = "testExtension";

    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'test'});
    }

    commands(): IExtensionCommand[] {
        const testCommand: IExtensionCommand = {
            name: 'hello-world',
            description: 'Replies with "Hello World"',
            options: [
                {
                    type: OptionTypes.String,
                    input: "test-string",
                    description: "This is a test option",
                },
                {
                    type: OptionTypes.Boolean,
                    input: "test-boolean",
                    description: "This is a test option",
                }
            ],
            method: (interaction: CommandInteraction) => {
                interaction.reply('Hello World');
                console.log(interaction.options);
            },
        }; 

        return [
            testCommand,
        ];
    }
}