import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand } from "../../utility/types";
import { PermissionCommand } from "./commands/permissionCommand";

export class AdminExtension extends BaseExtension {
    name: string = 'adminExtension';

    commands(): IExtensionCommand[] {
        const permissionCommand = new PermissionCommand(this.$state);

        return [
            permissionCommand.command,
        ]
    }
}