import { CommandInteraction, ContextMenuInteraction } from "discord.js";
import { BaseManager } from "./baseComponents/baseManager";
import { CommandManager } from "./commandManager";
import { EventManager } from "./eventManager";
import { ExtensionManager } from "./extensionManager";
import { encode } from './utility/hashids';
import { DiscordEventTypes, IEventPackage } from "./utility/types";

export class GuildManager extends BaseManager {
    commandManager: CommandManager;
    extensionManager: ExtensionManager;
    eventManager: EventManager;

    constructor(guildId: string) {
        const hashGuildId: string = encode(guildId);
        super(hashGuildId, { collectionKey: hashGuildId, documentKey: 'guild' });

        this.commandManager = new CommandManager(hashGuildId);
        this.extensionManager = new ExtensionManager(hashGuildId);
        this.eventManager = new EventManager(hashGuildId);

        this.init();
    }

    private init() {
        this.commandManager.registerCommands(this.extensionManager.loadedExtensions);
        this.commandManager.registerCommandResponse(this.extensionManager.loadedExtensions);
        this.eventManager.registerEventResponses(this.extensionManager.loadedExtensions);
    }

    public interaction(interaction: CommandInteraction | ContextMenuInteraction) {
        this.commandManager.interaction(interaction);
    }

    public event(eventType: DiscordEventTypes, eventPackage: IEventPackage) {
        this.eventManager.event(eventType, eventPackage);
    }
}