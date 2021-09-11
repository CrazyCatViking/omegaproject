import { BaseExtension } from "./baseComponents/baseExtension";
import { AdminExtension } from "./extensions/adminExtension/adminExtension";

export const extensions = (guildId: string): BaseExtension[] => {
    const adminExtension = new AdminExtension(guildId);
    
    return [
        adminExtension,
    ];
}