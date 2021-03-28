import Discord = require('discord.js');
import {Guild} from './guild';
const auth = require('./auth.json');

//Initialize discord event intents
const intents = [
    "GUILDS",
    //"GUILD_MEMBERS",
    "GUILD_BANS",
    "GUILD_EMOJIS",
    "GUILD_INTEGRATIONS",
    "GUILD_WEBHOOKS",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    //"GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGE_TYPING",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING"
]

//Initialize bot
const client = new Discord.Client({ws: {intents: intents as Discord.BitFieldResolvable<Discord.IntentsString>}}); //Load Discord Client
var connectedGuilds: {[id: string]: Guild} = {}; //List of connected guilds

//Logs bot in to Discord 
client.login(auth.token);
//Loads connected guilds/servers
client.once("ready", async () => {
    let guilds: Discord.Guild[] = client.guilds.cache.array();
    for (let i in guilds) {
        let guild = new Guild(guilds[i].id, guilds[i]); //Load guild/server
        connectedGuilds[guild.id] = guild;
        await guild.init(); //Init guild/server
        console.log("Loaded guild with id: " + guild.id);
    }
    console.log('Ready');
});

//Handles the event emitted when a new guild/server connects to omega
client.on("guildCreate", async (guild) => {
    if (connectedGuilds[guild.id] !== undefined) return;
    let newGuild = new Guild(guild.id, guild); //Load guild/server
    connectedGuilds[newGuild.id] = newGuild;
    await newGuild.init(); //Init guild/server
    console.log("Loaded guild with id: " + newGuild.id);
});

//Handles the event emitted when a guild/server kicks omega from the server
client.on("guildDelete", async (guild) => {
    if (connectedGuilds[guild.id] === undefined) return;
    delete connectedGuilds[guild.id]; //Unloads guild/server
    console.log("Unloading guild with id: " + guild.id);
});

//Handles the event emitted when a message is sent in a connected guild/server
client.on('message', (message) => {
    if (message.author.bot) return;

    if (message.guild === null) return;

    let guildId = message.guild?.id;
    if (guildId === undefined) return;

    connectedGuilds[guildId].message(message); //Forwards event to correct guild/server
});

//Handles the event emitted when a reaction is added to a message in a connected guild/server
client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return;  

    if (reaction.message.guild === null) return;

    let guildId = reaction.message.guild?.id;
    if (guildId === undefined) return;

    connectedGuilds[guildId].reactionAdd(reaction, user); //Forwards event to correct guild/server
});

//Handles the event emitted when a reaction is removed from a message in a connected guild/server
client.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;

    if (reaction.message.guild === null) return;

    let guildId = reaction.message.guild?.id;
    if (guildId === undefined) return;

    connectedGuilds[guildId].reactionRemove(reaction, user) //Forwards event to correct guild/server
});

client.on('messageDelete', (message) => {
    if (message.guild === null) return;

    let guildId = message.guild?.id;
    if (guildId === undefined) return;

    connectedGuilds[guildId].messageDelete(message);
});



