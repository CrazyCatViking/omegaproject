import { CommandInteraction } from "discord.js";
import { BaseCommand } from "../../../baseCommand";
import { IExtensionCommand } from "../../../utility/types";

export class TestCommand extends BaseCommand {
    template(): IExtensionCommand {
        return {
            name: 'test-command',
            description: 'This is a test command',
            method: this.methods.testMethod,
        }
    }

    methods = {
        testMethod: (interaction: CommandInteraction) => {
            interaction.reply('The test has completed successfully');
        },
    }
}