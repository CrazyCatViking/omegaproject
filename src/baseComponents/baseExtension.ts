import { IExtensionCommand, IExtensionContextCommand, IExtensionEvent } from "../utility/types";

export abstract class BaseExtension {
    enabled: boolean = true;
    name: string = "baseExtension";
    protected $state: Record<string, any>;
    protected $guildId: string;

    constructor(guildId: string) {
        this.$state = {};
        this.$guildId = guildId;
        this.init();
    }

    protected async init() {

    }

    commands(): IExtensionCommand[] {
        return [];
    }

    contextCommands(): IExtensionContextCommand[] {
        return [];
    }

    events(): IExtensionEvent[] {
        return [];
    }
}