import { BaseExtension } from "../../baseComponents/baseExtension";
import { useGraphQL } from "../../graphql/useGraphQL";
import { IExtensionCommand, IExtensionContextCommand } from "../../utility/types";
import { FFXIVCommand } from "./commands/ffxivCommand";
import { FFXIVContextCommands } from "./contextCommands/ffxivContextCommands";
import { ENABLE_FFXIV_EXTENSION } from "./gql/ffxivQueries";

export class FFXIVExtension extends BaseExtension {
    name: string = 'ffxivExtension';

    protected async init() {
        const { client } = useGraphQL({ dbContext: this.$guildId });

        // This should somehow be handled by the extension manager
        const {data: { enableExtension }} = await client.mutation({
            mutation: ENABLE_FFXIV_EXTENSION,
        });

        if (!enableExtension) return;
    }

    commands(): IExtensionCommand[] {
        const ffxivCommand = new FFXIVCommand({ state: this.$state, guildId: this.$guildId });

        return [
            ffxivCommand.command,
        ]
    }

    contextCommands(): IExtensionContextCommand[] {
        const ffxivContextCommands = new FFXIVContextCommands({ state: this.$state, guildId: this.$guildId });

        return [
            ffxivContextCommands.command,
        ]
    }
}