import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand } from "../../utility/types";
import { PermissionCommand } from "./commands/permissionCommand";

export class AdminExtension extends BaseExtension {
    name: string = 'adminExtension';

    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'extension/admin'});
    }

    commands(): IExtensionCommand[] {
        const permissionCommand = new PermissionCommand(this.$state);

        return [
            permissionCommand.command,
        ]
    }
}