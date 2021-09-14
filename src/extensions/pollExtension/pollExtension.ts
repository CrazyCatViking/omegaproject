import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand, IExtensionEvent, ISessionState } from "../../utility/types";
import { PollCommand } from "./commands/pollCommand";
import { Poll } from "./poll";

export class PollExtension extends BaseExtension {
    name: string = 'pollExtension';

    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'extension/pollExtension'});
        this.$state.sessionState.polls = new Map<string, Poll>();
    }

    commands(): IExtensionCommand[] {
        const pollCommand = new PollCommand(this.$state);

        return [
            pollCommand.command,
        ]
    }

    events(): IExtensionEvent[] {
        return [

        ]
    }
}