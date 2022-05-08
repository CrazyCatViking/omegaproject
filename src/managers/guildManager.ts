import { CommandInteraction, ContextMenuInteraction, Guild } from "discord.js";
import { BaseManager } from "../baseComponents/baseManager";
import { CommandManager } from "./commandManager";
import { EventManager } from "./eventManager";
import { ExtensionManager } from "./extensionManager";
import { encode } from '../utility/hashids';
import { DiscordEventTypes, IEventPackage } from "../utility/types";
import { useCommandNames } from "../utility/shared";
import { setOwnerPermissions } from "../helpers/setOwnerPermissions";

export class GuildManager extends BaseManager {
    private guild: Guild;
    private commandManager: CommandManager;
    private extensionManager: ExtensionManager;
    private eventManager: EventManager;
    ready: boolean;

    constructor(guild: Guild) {
        const hashGuildId: string = encode(guild.id);
        super(hashGuildId);

        this.guild = guild;
        this.commandManager = new CommandManager(hashGuildId);
        this.extensionManager = new ExtensionManager(hashGuildId);
        this.eventManager = new EventManager(hashGuildId);
        this.ready = false;

        this.init();
    }

    private async init() {
        const { setCommandNames } = useCommandNames(this.hashGuildId);
        
        setCommandNames(this.extensionManager.loadedExtensions);
        await this.commandManager.registerCommands(this.extensionManager.loadedExtensions);
        this.commandManager.registerCommandResponse(this.extensionManager.loadedExtensions);
        this.eventManager.registerEventResponses(this.extensionManager.loadedExtensions);
        
        // await setOwnerPermissions(this.guild);

        this.ready = true;
    }

    public interaction(interaction: CommandInteraction | ContextMenuInteraction) {
        if (!this.ready) return;
        this.commandManager.interaction(interaction);
    }

    public event(eventType: DiscordEventTypes, eventPackage: IEventPackage) {
        if (!this.ready) return;
        this.eventManager.event(eventType, eventPackage);
    }
}