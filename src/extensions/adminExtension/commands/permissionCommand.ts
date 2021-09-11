import { BaseCommand } from "../../../baseComponents/baseCommand";
import { IExtensionCommand } from "../../../utility/types";

export class PermissionCommand extends BaseCommand {
    template(): IExtensionCommand {
        return {
            name: 'permission',
            description: 'Manage bot command permissions',
        }
    }
} 