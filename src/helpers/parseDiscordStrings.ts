export const parseDiscordUsers = (users: string) => {
    const regEx = /(?<=@!)(.*?)(?=>)/g;
    return users.match(regEx);
}

export const parseDiscordRoles = (roles: string) => {
    const regEx = /(?<=@&)(.*?)(?=>)/g;
    return roles.match(regEx);
}