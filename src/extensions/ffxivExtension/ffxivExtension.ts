import { BaseExtension } from "../../baseComponents/baseExtension";
import { useGraphQL } from "../../graphql/useGraphQL";
import { IExtensionCommand } from "../../utility/types";
import { FFXIVCommand } from "./commands/ffxivCommand";

export class FFXIVExtension extends BaseExtension {
    name: string = 'ffxivExtension';

    protected async init() {
        const { client } = useGraphQL({ dbContext: this.$guildId });
    }

    commands(): IExtensionCommand[] {
        const ffxivCommand = new FFXIVCommand({ state: this.$state, guildId: this.$guildId });

        return [
            ffxivCommand.command,
        ]
    }
}