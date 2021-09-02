import { BaseExtension } from "./baseExtension";
import { BaseManager } from "./baseManager";

export class CommandManager extends BaseManager {
    constructor(guildId: string) {
        super({ collectionKey: guildId, documentKey: 'commands' });
    }

    registerCommands(extensions: {[key: string]: BaseExtension}): void {
        
    }
}