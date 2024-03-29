import { Guild } from "discord.js";

export const setOwnerPermissions = async (guild: Guild) => {
    try {
        const commands = await guild.commands.fetch(undefined, {force: true});

        commands.forEach(async (command) => {

            await command.permissions.add({permissions: [
                {
                    id: guild.ownerId,
                    type: 'USER',
                    permission: true,
                }
            ]});
        });
    } catch (error) {
        console.log(error);
    }
}