import { Guild } from "discord.js";

export const setOwnerPermissions = async (guild: Guild) => {
    const commands = await guild.commands.fetch();
    commands.forEach(async (command) => {
        const permissions = await command.permissions.fetch({permissionId: await guild.fetchOwner()});

        if (!permissions || permissions.find((item) => item.permission === true)) return;

        await command.permissions.add({permissions: [
            {
                id: guild.ownerId,
                type: 'USER',
                permission: true,
            }
        ]});
    });
}