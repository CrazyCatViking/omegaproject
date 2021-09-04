import { CommandInteraction, ContextMenuInteraction } from "discord.js";
import { BaseExtension } from "../../baseExtension";
import { ApplicationCommandType, IExtensionCommand, IExtensionContextCommand, OptionTypes } from "../../utility/types";

import { TestCommand } from "./commands/testCommand";
import { TestContextCommand } from "./contextCommands/testContextCommand";

export class TestExtension extends BaseExtension {
    name: string = "testExtension";

    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'test'});
    }

    commands(): IExtensionCommand[] {   
        const testCommand = new TestCommand(this.$state)

        return [
            testCommand.command,
        ];
    }

    contextCommands(): IExtensionContextCommand[] {
        const testContextCommand = new TestContextCommand(this.$state);

        return [
            testContextCommand.command,
        ];
    }
}