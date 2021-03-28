/*
    Module containing various tools used throughout the omega bot application
*/

import fs = require('fs');
import { Guild, MessageAttachment, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';

//Maps a directory and returns a string array with the available files
export function mapDir(dirPath: string): string[] {
    var dirFileMap: string[] = [];
    
    fs.readdirSync(dirPath).forEach(function(file) {
        dirFileMap.push(file);
    });

    return dirFileMap;
}

//Takes a raw string and splits it up into an array of individual arguments
export function getStringArguments(rawString: string): string[] {
    let argString: string = rawString;

    var l: number = argString.length;
    var args: string[] = [];
    var numArgs: number = 0;
    var currentArg: string = "";

    var compundArg: boolean = false;

    for (var i = 0; i <= l - 1; i++) {
        var chr: string = argString.charAt(i);

        if (chr == ' ' && compundArg == false && !(currentArg == "")) {
            args[numArgs] = currentArg;
            numArgs++;
            currentArg = "";
        } else if ((chr == '"' || chr == '“') && compundArg == false) {
            compundArg = true;
        } else if ((chr == '"' || chr == '”') && compundArg == true) {
            compundArg = false;
            args[numArgs] = currentArg;
            numArgs++;
            currentArg = "";
        } else {
            if (compundArg == true) {
                currentArg = currentArg + chr;
                if (i == l - 1) {
                    args[numArgs] = currentArg;
                    numArgs++;
                }
            } else if (!(chr == ' ')) {
                currentArg = currentArg + chr;
                if (i == l - 1) {
                    args[numArgs] = currentArg;
                    numArgs++;
                }
            }
        }
    }
    return (args);
}

//Check for flags "#flag"
export function checkFlags(args: string[]): {flags: string[], args: string[]} {
    var checkedArgs: string[] = [];
    var flags: string[] = [];
    for (var i in args) {
        let arg = args[i];
        if (arg.includes('#')) {
            flags.push(arg.slice(1));
        } else {
            checkedArgs.push(args[i]);
        } 
    }

    return {flags: flags, args: checkedArgs};
}

//Create embedded message
export function createEmbed(content: string, options?: {[option: string]: any}): MessageEmbed {
    var embed = new MessageEmbed()
    .setDescription(content)
    .setTimestamp()
    .setColor(0x00AE86);

    if (options === undefined) return embed;

    for (var option in options) {
        switch(option) {
            case "color":
                embed.setColor(options[option]);
                break;
            case "title":
                embed.setTitle(options[option]);
                break;
            case "footer":
                embed.setFooter(options[option]);
                break;
            case "thumbnail":
                embed.setThumbnail(options[option]);
                break;
            case "url":
                embed.setURL(options[option]);
                break;
            case "image":
                embed.setImage(options[option]);
                break;
            case "fields":
                let fields = options[option];

                for (var i in fields) {
                    embed.addField(fields[i].name, fields[i].value, fields[i].inline);
                }

                break;
            case "files":
                let attachment: Buffer = options[option].attachment;
                let name: string = options[option].name;

                let msgAttachment = new MessageAttachment(attachment, name);
                let msgAttatchArray: MessageAttachment[] = [];
                msgAttatchArray.push(msgAttachment);
                
                embed.attachFiles(msgAttatchArray);
                break;
            default:
                console.log("Invalid Option for Embed");
                break;
        }
    }

    return embed;
}

//Fetch Discord Message
export async function fetchMessage(messageId: string, channelId: string, guild: Guild) {
    let channel: TextChannel | NewsChannel | undefined = fetchChannel(channelId, guild);
    if (channel === undefined) return undefined;

    let message = await channel.messages.fetch(messageId);
    if (message === undefined) return undefined;

    return message;
}

//Fetch Discord Channel
export function fetchChannel(channelId: string, guild: Guild): TextChannel | NewsChannel | undefined {
    let channels = guild.channels.cache.array();
    let thisChannel = channels.find(channel => channel.id === channelId);

    if (thisChannel === undefined) return undefined;
    if (!thisChannel.isText()) return undefined;

    return thisChannel;
}

export function getCustomEmojiData(rawEmoji: string) {
    let name = "";
    let id = "";

    let gotName = false;
    let gettingName = false;
    for (let i = 0; i < rawEmoji.length; i++) {
        let chr = rawEmoji.charAt(i);

        if (!gotName) {
            if (chr === ":" && gettingName === false) {
                gettingName = true;
            } else if (chr === ":" && gettingName === true) {
                gettingName = false;
                gotName = true;
            } else if (chr !== ":" && chr !== "<" && chr !== ">") {
                name = name + chr;
            }
        } else {
            if (chr !== ":" && chr !== "<" && chr !== ">") {
                id = id + chr;
            }
        }
    }

    return {name: name, id: id};
}
