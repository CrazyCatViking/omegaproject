import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand } from "../../utility/types";
import { PermissionCommand } from "./commands/permissionCommand";

export class AdminExtension extends BaseExtension {
    name: string = 'adminExtension';

    commands(): IExtensionCommand[] {
        const permissionCommand = new PermissionCommand({ state: this.$state, guildId: this.$guildId });

        return [
            permissionCommand.command,
        ]
    }
}