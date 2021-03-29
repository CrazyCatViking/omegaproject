/*
    The FFXIV_Integration is an extension that allows a user to register their Final Fantasy XIV Online Character to
    their discord user, and then query for information about their characters levels and gear. The extension uses
    the XIVAPI to query information from the FFXIV Lodestone, and returns the information in custom
    generated graphics with information about their character.

    The extension supports getting information about character levels and character gear.

    To use this extension you have to get an api key for the XIVAPI and make sure you have the supplied fonts installed on your host.
*/

import { Guild, Message, GuildMember, MessageEmbed, User, MessageReaction, PartialUser, PartialMessage } from "discord.js";
import { Extension } from "../../extension";
import { createCanvas, loadImage, Image } from "canvas";
import { createEmbed, getStringArguments, checkFlags, getCustomEmojiData } from "../../omegaToolkit";
import { MessageTracker } from "../../extensionTools/messageTracker";

//Dependencies for XIVAPI
const XIVAPI = require('@xivapi/js');
const ffxiv_auth = require('./ffxiv_integration_extension/ffxiv_auth.json');
const ffxivfont = 'AdventPro-Medium';

//Dependencies for downloading graphics
const bent = require('bent');
const getBuffer = bent('buffer');

//Creates and returns extension to caller
export function createExtension() {
    return new FFXIV_Integration();
}

class FFXIV_Integration extends Extension {
    xiv: any; //XIVAPI object
    chrProfiles: {[discordId: string]: any}; //Stored character profiles
    messageTracker: MessageTracker; //Tracks Messages
    cache: {[chrId: string]: {chrProfile: any, timestamp: {time: number, day: number}}}; //Caches chrprofiles for 3 hours

    constructor() {
        //Sets initial values
        super();
        this.xiv = new XIVAPI(ffxiv_auth); //Initializes the XIVAPI
        this.chrProfiles = {};
        this.messageTracker = new MessageTracker();
        this.cache = {};
    }

    //Initialize extension
    async init(guild: Guild) {
        //Check database
        if (this.databaseObject === undefined) {
            this.databaseObject = {chrProfiles: {}};
            this.dbSend();
        }
        
        this.chrProfiles = this.databaseObject.chrProfiles;
        if (this.databaseObject.trackedMessages !== undefined) this.messageTracker.init(this.databaseObject.trackedMessages, guild);
    }

    //Commands
    //Registers the queried ffxiv character to the discord user
    async iam(args: string[], message: Message) {
        let chrForename: string = args[0];
        let chrSurname: string = args[1];
        let chrServer: string = args[2];
        let chrProfile: any;

        //Check if arguments are supplied
        if (chrForename === undefined || chrSurname === undefined) {
            return;
        }
        if (chrServer === undefined || chrServer === null) {
            return;
        }

        //Starts creating the reponse
        message.channel.startTyping();

        //Queries XIVAPI for the requested character
        let result: any;
        try {
            result = await getXivCharacter(chrForename + " " + chrSurname, chrServer, this.xiv);
        } catch (error) {
            message.channel.send(createEmbed(error));
            message.channel.stopTyping();
            return;
        }

        chrProfile = result;

        //Updates database 
        let member = message.member as GuildMember;
        this.chrProfiles[member.id] = chrProfile;
        if (this.databaseObject !== undefined) this.databaseObject["chrProfiles"] = this.chrProfiles;
        this.dbUpdate();

        //Creates response
        let content = "Your character profile has been registered!";
        let options = {
            title: chrProfile.Name,
            url: "https://na.finalfantasyxiv.com/lodestone/character/" + chrProfile.ID,
            thumbnail: chrProfile.Avatar
        }

        //Sends response
        let embedReponse: MessageEmbed = createEmbed(content, options);
        message.channel.send(embedReponse);
        message.channel.stopTyping(); //Finished assembling response to command
    }

    //Returns graphic with levelinformation of the callers registered ffxiv character
    async whoami(args: string[], message: Message) {
        let member = message.member as GuildMember;
        if (this.chrProfiles[member.id] === undefined) return; //Let caller know it failed, inform they need to do iam command

        let thisChrProfile = this.chrProfiles[member.id];

        //Creates response
        message.channel.startTyping();
        let getProfile: any;
        //Queries for character information from the XIVAPI
        try {
            getProfile = await this.getXivProfile(thisChrProfile.ID, this.xiv, ["MIMO"]);
        } catch {
            let embed = createEmbed("The request timed out, please try again.");
            message.channel.send(embed);
            message.channel.stopTyping();
            return;
        }

        let chrProfile = getProfile.Character;

        //Generate response graphics and send it
        let profileEmbed = await generateProfileEmbed(chrProfile);
        message.channel.send(profileEmbed);
        message.channel.stopTyping();
    }

    //Returns character level graphics about the requested character or the mentioned users registered character
    async whois(args: string[], message: Message) {
        let users: User[] = message.mentions.users.array();
        //Checks if there are mentioned users, if there are it generates graphich for their registered users
        if (users.length !== 0) {
            message.channel.startTyping();
            for (var i in users) {
                if (this.chrProfiles[users[i].id] !== undefined) {
                    let thisChrProfile: any = this.chrProfiles[users[i].id];
                    let getProfile: any;
                    try {
                        getProfile = await this.getXivProfile(thisChrProfile.ID, this.xiv, ["MIMO"]);
                    } catch {
                        let embed = createEmbed("The request timed out, please try again.");
                        message.channel.send(embed);
                    }
                
                    let chrProfile: any = getProfile.Character;

                    let embedResponse = await generateProfileEmbed(chrProfile);
                    await message.channel.send(embedResponse);
                }
            }
            message.channel.stopTyping();
        } else {
            //Does standard user Query if no users are mentioned
            let chrForename: string = args[0];
            let chrSurname: string = args[1];
            let chrServer: string = args[2];

            //Checks if character names and server were supplied
            if (chrForename === undefined || chrSurname === undefined) {
                console.log("No character name");
                return;
            }

            if (chrServer === undefined) {
                console.log("No character server");
                return;
            }

            //creates resobse
            message.channel.startTyping();
            let result: any;
            try {
                result = await getXivCharacter(chrForename + " " + chrSurname, chrServer, this.xiv);
            } catch (error) {
                message.channel.send(createEmbed(error));
                message.channel.stopTyping();
                return;
            }

            //If results are valid, queries for character information'
            let getProfile: any;
            try {
                getProfile = await this.getXivProfile(result.ID, this.xiv, ["MIMO"]);
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }
            
            let chrProfile: any = getProfile.Character;

            //Generates graphivs and response and sends to user
            let embedResponse = await generateProfileEmbed(chrProfile);
            message.channel.send(embedResponse);
            message.channel.stopTyping();
        }
    }

    //Returns graphics with information about characters gear for mention users character, callers character or queried character
    async gear(args: string[], message: Message) {
        let member = message.member as GuildMember;

        //Checks if there are mentioned users;
        let users: User[] = message.mentions.users.array();
        if (users.length !== 0) {
            message.channel.startTyping();
            for (var i in users) {
                if (this.chrProfiles[users[i].id] !== undefined) {
                    let thisChrProfile: any = this.chrProfiles[users[i].id];
                    let getProfile: any;
                    //Queries for character information and returns graphics with gear information
                    try {
                        getProfile = await this.getXivProfile(thisChrProfile.ID, this.xiv, ["MIMO"]);
                    } catch {
                        let embed = createEmbed("The request timed out, please try again.");
                        message.channel.send(embed);
                        message.channel.stopTyping();
                        return;
                    }
                    
                    let chrProfile: any = getProfile.Character;

                    let embedResponse = await generateGearEmbed(chrProfile);
                    await message.channel.send(embedResponse);
                }
            }
            message.channel.stopTyping();
        } else if (args[0] !== undefined) {
            //If character names and server were entered, query based on those
            let chrForename: string = args[0];
            let chrSurname: string = args[1];
            let chrServer: string = args[2];

            if (chrForename === undefined || chrSurname === undefined) {
                console.log("No character name");
                return;
            }

            if (chrServer === undefined) {
                console.log("No character server");
                return;
            }

            message.channel.startTyping();
            let result: any;
            try {
                result = await getXivCharacter(chrForename + " " + chrSurname, chrServer, this.xiv);
            } catch (error) {
                message.channel.send(createEmbed(error));
                message.channel.stopTyping();
                return;
            }

            //If results are valid, query for character gear information
            let getProfile: any;
            try {
                getProfile = await this.getXivProfile(result.ID, this.xiv, ["MIMO"]);
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }
    
            let chrProfile: any = getProfile.Character;

            //Generate gear graphics and return to user
            let embedResponse = await generateGearEmbed(chrProfile);
            message.channel.send(embedResponse);
            message.channel.stopTyping();
        } else {
            //If there are no mentioned users, and no character names and server, return the callers registered character information
            if (this.chrProfiles[member.id] === undefined) return; //Let caller know it failed, inform they need to do iam command

            let thisChrProfile = this.chrProfiles[member.id];
            
            message.channel.startTyping();
            let getProfile: any;
            //Query for character gear information
            try {
                getProfile = await this.getXivProfile(thisChrProfile.ID, this.xiv, ["MIMO"]);
            } catch (error) {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }

            let chrProfile = getProfile.Character;
            
            //Generate gear graphics and return to user
            let profileEmbed = await generateGearEmbed(chrProfile);
            message.channel.send(profileEmbed);
            message.channel.stopTyping();
        }
    }

    //Returns information if a xiv character has a mount
    async hasmount(args: string[], message: Message) {
        let member = message.member as GuildMember;
        let mount = args[0];
        let hasMount: {[chrName: string]: boolean} = {};

        //Query based on mentions
        let users: User[] = message.mentions.users.array();
        if (users.length !== 0) {
            message.channel.startTyping();
            for (let i in users) {
                if (this.chrProfiles[users[i].id] !== undefined) {
                    let thisChr = this.chrProfiles[users[i].id];
                    let profile: any;
                    try {
                        profile = await this.getXivProfile(thisChr.ID, this.xiv, ["MIMO"]);
                    } catch (error) {
                        let embed = createEmbed(error);
                        message.channel.send(embed);
                        return;
                    }

                    if (profile !== undefined) {
                        let mounts: {Icon: string, Name: string}[] = profile.Mounts;
                        if (mounts.find(object => object.Name === mount) !== undefined) {
                            hasMount[profile.Character.Name] = true;
                        } else {
                            hasMount[profile.Character.Name] = false;
                        }
                    }
                }
            }

            let response: string = "**Checked if the following have: " + mount + "**\n\n";
            for (let chrName in hasMount) {
                response = response + "**" + chrName + "**: " + hasMount[chrName] + "\n";
            }

            let embed = createEmbed(response);
            message.channel.send(embed);
            message.channel.stopTyping();

            return;
        }

        //Query based on tracked post
        let messageFlag: string = args[1];
        if (messageFlag === "#message") {
            message.channel.startTyping();
            let messageId = args[2];
            let emoji = args[3];
            if (messageId === undefined) return;
            if (emoji === undefined) return;

            if (!this.messageTracker.isTracked(messageId)) return;

            let emojiData = getCustomEmojiData(emoji);

            let reactions = this.messageTracker.messages[messageId].reactions.cache.array();
            let thisReaction = reactions.find(reaction => reaction.emoji.id === emojiData.id);
            if (thisReaction === undefined) return;
            
            let users = thisReaction.users.cache.array();
            for (let i in users) {
                let user = users[i];
                if (this.chrProfiles[user.id] !== undefined) {
                    let profile: any;
                    try {
                        profile = await this.getXivProfile(this.chrProfiles[user.id].ID, this.xiv, ["MIMO"]);
                    } catch (error) {
                        console.log(error);
                    }
                    
                    if (profile !== undefined) {
                        let mounts: {Icon: string, Name: string}[] = profile.Mounts;
                        if (mounts.find(object => object.Name === mount) !== undefined) {
                            hasMount[profile.Character.Name] = true;
                        } else {
                            hasMount[profile.Character.Name] = false;
                        }
                    }
                }
            }

            let response: string = "**Checked if the following have: " + mount + "**\n\n";
            for (let chrName in hasMount) {
                response = response + "**" + chrName + "**: " + hasMount[chrName] + "\n";
            }

            let embed = createEmbed(response);
            message.channel.send(embed);
            message.channel.stopTyping();

            return;
        }

        //Query based on Chr search
        let chrForename = args[1];
        let chrSurname = args[2];
        let chrServer = args[3];

        if (chrForename !== undefined && chrSurname !== undefined && chrServer !== undefined) {
            message.channel.startTyping();
            let chr: any;
            try {
                chr = await getXivCharacter(chrForename + " " + chrSurname, chrServer, this.xiv);
            } catch (error) {
                message.channel.send(createEmbed(error));
                message.channel.stopTyping();
                return;
            }

            if (chr === undefined) return;

            let profile: any;
            try {
                profile = await this.getXivProfile(chr.ID, this.xiv, ["MIMO"]);
            } catch (error) {
                message.channel.send(createEmbed(error));
                message.channel.stopTyping();
                return;
            }

            if (profile !== undefined) {
                let mounts: {Icon: string, Name: string}[] = profile.Mounts;
                if (mounts.find(object => object.Name === mount) !== undefined) {
                    hasMount[profile.Character.Name] = true;
                } else {
                    hasMount[profile.Character.Name] = false;
                }
            } else {
                return;
            }

            let response: string = "**Checked if the following have: " + mount + "**\n\n";
            for (let chrName in hasMount) {
                response = response + "**" + chrName + "**: " + hasMount[chrName] + "\n";
            }

            let embed = createEmbed(response);
            message.channel.send(embed);
            message.channel.stopTyping();

            return;
        }

        //Query based on caller
        if (this.chrProfiles[member.id] !== undefined) {
            message.channel.startTyping();
            let chrProfile = this.chrProfiles[member.id];
            let profile: any;

            try {
                profile = await this.getXivProfile(chrProfile.ID, this.xiv, ["MIMO"]);
            } catch (error) {
                let embed = createEmbed(error);
                message.channel.send(embed);
                return;
            }

            if (profile !== undefined) {
                let mounts: {Icon: string, Name: string}[] = profile.Mounts;
                if (mounts.find(object => object.Name === mount) !== undefined) {
                    hasMount[profile.Character.Name] = true;
                } else {
                    hasMount[profile.Character.Name] = false;
                }
            } else {
                return;
            }

            let response: string = "**Checked if the following have: " + mount + "**\n\n";
            for (let chrName in hasMount) {
                response = response + "**" + chrName + "**: " + hasMount[chrName] + "\n";
            }

            let embed = createEmbed(response);
            message.channel.send(embed);
            message.channel.stopTyping();

            return;
        }
    }

    //Untracks a tracked post
    async untrackMessage(args: string[], message: Message) {
        let messageId = args[0];
        if (!this.messageTracker.isTracked(messageId)) return;

        this.messageTracker.untrackMessage(messageId);
        let embed = createEmbed("The specified message has been untracked");
        message.channel.send(embed);

        let storableObject = this.messageTracker.getStorableObjet();
        if (this.databaseObject !== undefined) this.databaseObject.trackedMessages = storableObject;
        this.dbUpdate();
    }

    //Lists the tracked posts
    async listTrackedMessages(args: string[], message: Message) {
        let trackedMessages = this.messageTracker.getTrackedMessages();
        let title = "**These are the currently tracked messages**";
        let response = "";

        for (let i in trackedMessages) {
            let shortContent = trackedMessages[i].shortContent;
            let url = trackedMessages[i].url;
            let messageId = trackedMessages[i].messageId;
            let channelName = trackedMessages[i].channelName;
            response = response + "MessageID - **[" + messageId + "](" + url + ")**: " + shortContent + " in **" + channelName + "**\n\n"; 
        }

        let embed = createEmbed(response, {title: title});
        message.channel.send(embed);
    }

    //Events
    //Handles new messages
    message(message: Message) {
        let content = message.content;
        let args = getStringArguments(content);
        let checkedArgs = checkFlags(args);
        let flags = checkedArgs.flags;

        if (flags.includes("fftrack")) {
            this.messageTracker.trackMessage(message);
            let storableObject = this.messageTracker.getStorableObjet();
            if (this.databaseObject !== undefined) this.databaseObject.trackedMessages = storableObject;
            this.dbUpdate();
        }
    }

    //Handles new reacitons 
    reactionAdd(reactoion: MessageReaction, user: User | PartialUser) {

    }

    //Handles removed reactions
    reactionRemove(reactoion: MessageReaction, user: User | PartialUser) {

    }

    //Handles deleted messages
    messageDelete(message: Message | PartialMessage) {
        let id = message.id;
        if (this.messageTracker.isTracked(id)) {
            this.messageTracker.untrackMessage(id);
            let storableObject = this.messageTracker.getStorableObjet();
            if (this.databaseObject !== undefined) this.databaseObject.trackedMessages = storableObject;
            this.dbUpdate();
        }
    }

    async getXivProfile(chrId: string, xivapi: any, options: string[]) {
        let chrProfile: any;
        let data: string = "";
        let date = new Date();
    
        if (this.cache[chrId] !== undefined && (Math.abs(date.getHours() - this.cache[chrId].timestamp.time) < 3) && date.getDay() === this.cache[chrId].timestamp.day) {
            if (options.includes("MIMO")) {
                if (this.cache[chrId].chrProfile.Mounts !== null) {
                    return this.cache[chrId].chrProfile;
                }
            } else {
                return this.cache[chrId].chrProfile;
            }
        }
    
        for (let i in options) {
            data = data + options[i] + ",";
        }
    
        try {
            chrProfile = await xivapi.character.get(chrId, {extended: 1, data});
        } catch {
            throw ("The request timed out"); 
        }

        this.cache[chrId] = {chrProfile: chrProfile, timestamp: {time: date.getHours(), day: date.getDay()}};
        return chrProfile;
    }
}

//Queries xivapi for characters matching the name and
async function getXivCharacter(chrName: string, chrServer: string, xivapi: any) {
    let searchObject: any;
    let error: string;
    try {
        searchObject = await xivapi.character.search(chrName, {server: chrServer});
    } catch (err) {
        error = "The request failed, please try again.";
        throw (error);
    }

    let results = searchObject["Results"];

    if (results.length === 0) {
        error = "There were no characters with the name **" + chrName + "** on **" + chrServer + "**"
        throw (error);
    } else if (results.length === 1) {
        return results[0];
    } else if (results.length > 1) {
        for (let i in results) {
            if (results[i].Name === chrName) {
                return results[i];
            }
        }

        error = "Hmmm, strange. There were multiple results, and none were the requested character. Please try again.";
        throw (error);
    }
}

//Methods for generating graphics
//Creates custom image and returns it in an embed
async function generateProfileEmbed(chrProfile: any) {
        //Implement pretty pretty image system
        var canvas = createCanvas(1280, 873);
        var ctx = canvas.getContext('2d');

        let img: Buffer = await getImage(chrProfile.Portrait);
        let profileImg = new Image();
        profileImg.src = img;

        let frame = await loadImage("./extensions/ffxiv_integration/ffxiv_integration_extension/ffxiv_profile_frame.png");

        ctx.drawImage(profileImg, 640, 0);
        ctx.drawImage(frame, 0, 0);

        drawText(chrProfile.Name, 320, 100, ctx, {"font": '70px ' + "OPTIEngeEtienne", "alignment": "center"});
        drawText(chrProfile.Title.Name, 320, 150, ctx, {"font": '40px ' + ffxivfont, "alignment": "center"});

        drawLvlText(chrProfile.ClassJobs, ctx);

        let finalImage: Buffer = canvas.toBuffer();

        let content = "";
        let options =  {
            title: chrProfile.Name,
            url: "https://na.finalfantasyxiv.com/lodestone/character/" + chrProfile.ID,
            files: {attachment: finalImage, name: "profile.png"},
            image: "attachment://profile.png"
        }

        let profileEmbed: MessageEmbed = createEmbed(content, options);
        return profileEmbed;
}
//Returns gearEmbed
async function generateGearEmbed(chrProfile: any) {
        var canvas = createCanvas(2000, 920);
        var ctx = canvas.getContext('2d');
        let gear: any = chrProfile.GearSet;

        let img: Buffer = await getImage(chrProfile.Portrait);
        let profileImg = new Image();
        profileImg.src = img;

        let frame = await loadImage("./extensions/ffxiv_integration/ffxiv_integration_extension/ffxiv_gear_frame.png");

        ctx.drawImage(profileImg, 700, 23.5);
        ctx.drawImage(frame, 0, 0);

        let jobTxt = "LVL " + chrProfile.ActiveClassJob.Level + " " + chrProfile.ActiveClassJob.Job.Name;
        drawText(jobTxt.toUpperCase(), 1000, 700, ctx, {"font": '40px ' + ffxivfont, "alignment": "center"});
        drawText(chrProfile.Name, 1000, 780, ctx, {"font": '70px ' + "OPTIEngeEtienne", "alignment": "center"});
        drawText(chrProfile.Title.Name, 1000, 830, ctx, {"font": '40px ' + ffxivfont, "alignment": "center"});

        //Set default drawing coordinates and data
        let x = 600;  //Start X Pos
        let y = 20;   //Start Y pos
        let dx = 720; //Delta between rows
        let dim = 80; //Icon Dimensions
        let off = 50; //Drawing Offset
        let r = 1;    //Starting row
        let drawData: {[data: string]: number} = {"x": x, "y": y, "dx": dx, "dim": dim, "off": off, "r": r};

        await drawGearIcons(gear, ctx, drawData);
        await drawGearLvl(gear, ctx, drawData);
        await drawGearMelds(gear, ctx, drawData);
        await drawGearText(gear, ctx, drawData);

        let finalImage: Buffer = canvas.toBuffer();

        let content = "";
        let options =  {
            title: chrProfile.Name,
            url: "https://na.finalfantasyxiv.com/lodestone/character/" + chrProfile.ID,
            files: {attachment: finalImage, name: "gear.png"},
            image: "attachment://gear.png"
        }
        let profileEmbed: MessageEmbed = createEmbed(content, options);
        return profileEmbed;
}
//Get image data and return as a buffer
async function getImage(URL: string) {
        let image = await getBuffer(URL);
        return image;
}
//Draw Generic Text
function drawText(text: string, x: number, y: number, ctx: any, options?: {[option: string]: any}) {
        var alignment: string = "left";
        var color: string = "rgb(255, 255, 255)";
        var font: string = "30px Liberation Serif";
        var x: number = x;
        var y: number = y;

        //Check for custom options
        for (var option in options) {
            switch (option) {
                case "alignment":
                    alignment = options[option];
                    break;
                case "font":
                    font = options[option];
                    break;
                case "color":
                    color = options[option];
                    break;
                default:
                    break;
            }
        }

        //Set draw styles
        ctx.font = font;
        ctx.fillStyle = color;

        //Calculate alignment
        let textData = ctx.measureText(text); //Measure text length
        switch (alignment) {
            case "center":
                let halfWidth = textData.width / 2;
                x = x - halfWidth;
                break;
            case "right":
                x = x - textData.width;
                break;
            default:
                break;
        }

        ctx.fillText(text, x , y);
}
//Draw lvl text on image
function drawLvlText(chrClassJobs: any, ctx: any) {
        let jobs: {[abr: string]: string} = {
            "MRD": "-",
            "DRK": "-",
            "GLA": "-",
            "GNB": "-",
            "CNJ": "-",
            "SCH": "-",
            "AST": "-",
            "PGL": "-",
            "LNC": "-",
            "ROG": "-",
            "SAM": "-",
            "ARC": "-",
            "MCH": "-",
            "DNC": "-",
            "THM": "-",
            "SMN": "-",
            "RDM": "-",
            "BLU": "-",
            "MIN": "-",
            "BTN": "-",
            "FSH": "-",
            "CRP": "-",
            "BSM": "-",
            "ARM": "-",
            "GSM": "-",
            "LTW": "-",
            "WVR": "-",
            "ALC": "-",
            "CUL": "-"
        }

        for (var i in chrClassJobs) {
            let thisChrClassJob = chrClassJobs[i];
            let classJob: string = thisChrClassJob.Class.Abbreviation;

            if (classJob === "ACN") {
                jobs["SCH"] = thisChrClassJob.Level;
                jobs["SMN"] = thisChrClassJob.Level;
            } else {
                jobs[classJob] = thisChrClassJob.Level;
            }
        }

        ctx.font = '41.25px ' + ffxivfont;
        
        
        var x = 105;
        var y = 284.875;
        var r = 1;

        for (var job in jobs) {
            if (y > 722.375) {
                y = 284.875;
                x = x + 150;
                r = r + 1;
            }
            
            if (y == 534.875 && r != 4) y = y + 62.5;

            ctx.fillText(jobs[job], x, y);
            y = y + 62.5;
        }


}
//GEAR DRAWING METHODS
//Draw Gear Icons
async function drawGearIcons(gear: any, ctx: any, drawData: {[data: string]: number}) {
        let items: {[item: string]: string} = {
            "MainHand": "",
            "Head": "",
            "Body": "",
            "Hands": "",
            "Waist": "",
            "Legs": "",
            "Feet": "",
            "OffHand": "",
            "Earrings": "",
            "Necklace": "",
            "Bracelets": "",
            "Ring1": "",
            "Ring2": ""
        }

        //Get gear icon urls
        let gearItems = gear.Gear;
        for (var item in gearItems) {
            if (items[item] !== undefined) {
                items[item] = "https://xivapi.com" + gearItems[item].Item.Icon;
            }
        }

        //Download gear icons to buffer
        let itemImgs: {[itemName: string]: Buffer} = {};
        for (var item in items) {
            if (items[item] !== "") {
                let img: Buffer = await getImage(items[item]);
                itemImgs[item] = img;
            } else {
                let imgLoad = await loadImage("./extensions/ffxiv_integration/ffxiv_integration_extension/empty_icon.png");
                let img: Buffer = imgLoad.src as Buffer;
                itemImgs[item] = img;
            }
        }

        //Draw gear icons from buffer
        var x = drawData.x;
        var y = drawData.y;
        var dim = drawData.dim;
        var off = drawData.off;
        var r = drawData.r;
        for (var item in itemImgs) {
            let icon = new Image();
            icon.src = itemImgs[item];

            if (y > (drawData.y + 6*(dim + off)) && r === 1) {
                r = 2;
                y = drawData.y;
                x = drawData.x + drawData.dx;
            }

            ctx.drawImage(icon, x, y, dim, dim);

            y = y + dim + off;
        }
}
//Draw Gear Lvl
async function drawGearLvl(gear: any, ctx: any, drawData: {[data: string]: number}) {
        let items: {[item: string]: string} = {
            "MainHand": "",
            "Head": "",
            "Body": "",
            "Hands": "",
            "Waist": "",
            "Legs": "",
            "Feet": "",
            "OffHand": "",
            "Earrings": "",
            "Necklace": "",
            "Bracelets": "",
            "Ring1": "",
            "Ring2": ""
        }

        //Get gear lvls
        let gearItems = gear.Gear;
        for (var item in gearItems) {
            if (items[item] !== undefined) {
                items[item] = gearItems[item].Item.LevelItem;
            }
        }

        //Initialize coordinates and offsets
        let textOffX = 10;
        let textOffY = 45;
        var x = drawData.x - textOffX;
        var y = drawData.y + textOffY;
        var r = drawData.r;
        var dim = drawData.dim;
        var off = drawData.off;
        var alignment = "right";

        //Draw Lvl Text
        for (var item in items) {
            if (y > (drawData.y + textOffY + 6*(dim + off)) && r === 1) {
                r = 2;
                y = drawData.y + textOffY;
                x = drawData.x + drawData.dx + drawData.dim + textOffX;
                alignment = "left";
            }

            drawText(items[item], x, y, ctx, {"alignment": alignment, "font": "50px " + ffxivfont, "color": "orange"});

            y = y + dim + off;
        }

}
//Draw Gear Melds
async function drawGearMelds(gear: any, ctx: any, drawData: {[data: string]: number}) {
        let items: {[item: string]: any} = {
            "MainHand": [],
            "Head": [],
            "Body": [],
            "Hands": [],
            "Waist": [],
            "Legs": [],
            "Feet": [],
            "OffHand": [],
            "Earrings": [],
            "Necklace": [],
            "Bracelets": [],
            "Ring1": [],
            "Ring2": []
        }

        //Get gear melds
        let gearItems = gear.Gear;
        for (var item in gearItems) {
            if (items[item] !== undefined) {
                items[item] = gearItems[item].Materia;
            }
        }
        
        //Get Meld Icons
        var meldIcons: {[iconUrl: string]: Buffer} = {};
        for (var item in items) {
            let melds = items[item];
            for (var i in melds) {
                let materia = melds[i];
                if (meldIcons[materia.ID] === undefined) {
                    let img: Buffer = await getImage("https://xivapi.com" + materia.Icon);
                    meldIcons[materia.ID] = img;
                }
            }
        }

        //Initialize draw coordinates and offsets
        let offsetX = 160;
        let offsetY = 0;
        let iconDim = 50;
        let iconDx = 10;
        var x = drawData.x - offsetX;
        var y = drawData.y + offsetY;
        var r = drawData.r;
        var startX = drawData.x - offsetX;
        var dim = drawData.dim;
        var off = drawData.off;

        //Draw Meld Icons
        for (var item in items) {
            if (y > (drawData.y + offsetY + 6*(dim + off)) && r === 1) {
                r = 2;
                y = drawData.y + offsetY;
                x = drawData.x + drawData.dx + drawData.dim + offsetX - iconDim;
                startX = x;
            }

            let melds = items[item];
            for (var i in melds) {
                let materia = melds[i];
                let icon = new Image();
                icon.src = meldIcons[materia.ID];

                ctx.drawImage(icon, x, y, iconDim, iconDim);
                if (r === 1) {
                    x = x - iconDim - iconDx;
                } else if (r === 2) {
                    x = x + iconDim + iconDx;
                }
            }
            
            x = startX;
            y = y + dim + off;
        }
}
//Draw Gear Text
async function drawGearText(gear: any, ctx: any, drawData: {[data: string]: number}) {
        let items: {[item: string]: {[type: string]: string}} = {
            "MainHand": {},
            "Head": {},
            "Body": {},
            "Hands": {},
            "Waist": {},
            "Legs": {},
            "Feet": {},
            "OffHand": {},
            "Earrings": {},
            "Necklace": {},
            "Bracelets": {},
            "Ring1": {},
            "Ring2": {}
        }

        //Get gear and mirage names
        let gearItems = gear.Gear;
        for (var item in gearItems) {
            if (items[item] !== undefined) {
                let mirage = "";
                if (gearItems[item].Mirage !== null) mirage = gearItems[item].Mirage.Name;
                items[item] = {"name": gearItems[item].Item.Name, "mirage": mirage}; 
            } 
        }

        //Init coordinates and offsets 
        let textOffX = 10;
        let textOffY = 80;
        var x = drawData.x - textOffX;
        var y = drawData.y + textOffY;
        var r = drawData.r;
        var dim = drawData.dim;
        var off = drawData.off;
        var alignment = "right";

        //Draw gear text
        for (var item in items) {
            if (y > (drawData.y + textOffY + 6*(dim + off)) && r === 1) {
                r = 2;
                y = drawData.y + textOffY;
                x = drawData.x + drawData.dx + drawData.dim + textOffX;
                alignment = "left";
            }

            if (items[item].name !== undefined) drawText(items[item].name, x, y, ctx, {"alignment": alignment, "font": "25px " + ffxivfont, "color": "white"});
            if (items[item].mirage !== undefined) drawText(items[item].mirage, x, y + 30, ctx, {"alignment": alignment, "font": "25px " + ffxivfont, "color": "orange"});

            y = y + dim + off;
        }

}