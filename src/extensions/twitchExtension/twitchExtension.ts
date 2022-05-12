import { BaseExtension } from "../../baseComponents/baseExtension";
import { IExtensionCommand } from "../../utility/types";
import { TwitchCommand } from "./commands/twitchCommand";

export class TwitchExtension extends BaseExtension {
  name = 'twitchExtension';

  commands(): IExtensionCommand[] {
    const twitchCommand = new TwitchCommand({  state: this.$state, guildId: this.$guildId });

    return [
      twitchCommand.command,
    ]
  }
}