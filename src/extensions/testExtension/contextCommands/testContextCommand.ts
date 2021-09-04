import { ContextMenuInteraction } from "discord.js";
import { BaseContextCommand } from "../../../baseContextCommand";
import { ApplicationCommandType, IExtensionContextCommand } from "../../../utility/types";

export class TestContextCommand extends BaseContextCommand {
    template(): IExtensionContextCommand {
        return {
           name: 'test-context-user-command',
           type: ApplicationCommandType.UserCommand,
           method: this.methods.testMethod,
        }
    } 

    methods = {
        testMethod: (interaction: ContextMenuInteraction) => {
            interaction.reply('Test Context User Command');
        },
    }
}