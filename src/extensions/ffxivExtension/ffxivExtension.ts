import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand } from "../../utility/types";
import { FFXIVCommand } from "./commands/ffxivCommand";

export class FFXIVExtension extends BaseExtension {
    name: string = 'ffxivExtension';

    commands(): IExtensionCommand[] {
        const ffxivCommand = new FFXIVCommand(this.$state);

        return [
            ffxivCommand.command,
        ]
    }
}