import { BaseExtension } from "./baseComponents/baseExtension";
import { AdminExtension } from "./extensions/adminExtension/adminExtension";
import { PollExtension } from "./extensions/pollExtension/pollExtension";

export const extensions = (guildId: string): BaseExtension[] => {
    const adminExtension = new AdminExtension(guildId);
    const pollExtension = new PollExtension(guildId);
    
    return [
        adminExtension,
        pollExtension,
    ];
}