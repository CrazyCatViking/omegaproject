import { BaseExtension } from "./baseComponents/baseExtension";
import { AdminExtension } from "./extensions/adminExtension/adminExtension";
import { FFXIVExtension } from "./extensions/ffxivExtension/ffxivExtension";
import { PollExtension } from "./extensions/pollExtension/pollExtension";

export const extensions = (guildId: string): BaseExtension[] => {
    const adminExtension = new AdminExtension(guildId);
    const pollExtension = new PollExtension(guildId);
    const ffxivExtension = new FFXIVExtension(guildId);
    
    return [
        adminExtension,
        pollExtension,
        ffxivExtension,
    ];
}