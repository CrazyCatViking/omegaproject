import { CommandInteraction, ContextMenuInteraction } from "discord.js";
import { BaseManager } from "./baseManager";
import { CommandManager } from "./commandManager";
import { ExtensionManager } from "./extensionManager";
import { encode } from './utility/hashids';

export class GuildManager extends BaseManager {
    commandManager: CommandManager;
    extensionManager: ExtensionManager;

    constructor(guildId: string) {
        const hashGuildId: string = encode(guildId);
        super({ collectionKey: hashGuildId, documentKey: 'guild' }, hashGuildId);

        this.commandManager = new CommandManager(hashGuildId);
        this.extensionManager = new ExtensionManager(hashGuildId);

        this.init();
    }

    private init() {
        this.commandManager.registerCommands(this.extensionManager.loadedExtensions);
        this.commandManager.registerCommandResponse(this.extensionManager.loadedExtensions);
    }

    public interaction(interaction: CommandInteraction | ContextMenuInteraction) {
        this.commandManager.interaction(interaction);
    }
}