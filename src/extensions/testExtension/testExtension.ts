import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand, IExtensionContextCommand, IExtensionEvent } from "../../utility/types";

import { TestCommand } from "./commands/testCommand";
import { TestContextCommand } from "./contextCommands/testContextCommand";
import { TestEvent } from "./events/testEvent";

export class TestExtension extends BaseExtension {
    name: string = "testExtension";

    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'extension/test'});
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

    events(): IExtensionEvent[] {
        const testEvent = new TestEvent(this.$state);

        return [
            testEvent.eventHandler,
        ];
    }
}