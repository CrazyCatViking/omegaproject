import { BaseManager } from "./baseManager";
import { CommandManager } from "./commandManager";
import { ExtensionManager } from "./extensionManager";
import { encode } from './utility/hashids';

export class GuildManager extends BaseManager {
    commandManager: CommandManager;
    extensionManager: ExtensionManager;

    constructor(guildId: number) {
        const hashGuildId: string = encode(guildId);
        super({ collectionKey: hashGuildId, documentKey: 'guild' });

        this.commandManager = new CommandManager(hashGuildId);
        this.extensionManager = new ExtensionManager(hashGuildId);

        this.init();
    }

    init() {
        this.commandManager.registerCommands(this.extensionManager.loadedExtensions);
    }
}