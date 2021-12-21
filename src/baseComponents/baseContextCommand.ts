import { ICommandOptions, IExtensionContextCommand } from "../utility/types";

export abstract class BaseContextCommand {
    protected $state: Record<string, unknown>;
    protected $guildId: string;

    constructor ({ state, guildId }: ICommandOptions) {
        this.$state = state ?? {};
        this.$guildId = guildId ?? '';
    }

    get command(): IExtensionContextCommand {
        return this.template();
    }

    protected template(): IExtensionContextCommand {
        return {} as IExtensionContextCommand;
    }
}