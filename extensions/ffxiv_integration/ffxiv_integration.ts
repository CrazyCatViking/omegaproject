/*
    The FFXIV_Integration is an extension that allows a user to register their Final Fantasy XIV Online Character to
    their discord user, and then query for information about their characters levels and gear. The extension uses
    the XIVAPI to query information from the FFXIV Lodestone, and returns the information in custom
    generated graphics with information about their character.

    The extension supports getting information about character levels and character gear.

    To use this extension you have to get an api key for the XIVAPI and make sure you have the supplied fonts installed on your host.
*/

import { Guild, Message, GuildMember, MessageEmbed, User } from "discord.js";
import { Extension } from "../../extension";
import { createCanvas, loadImage, Image } from "canvas";
import { createEmbed } from "../../omegaToolkit";

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

    constructor() {
        //Sets initial values
        super();
        this.xiv = new XIVAPI(ffxiv_auth); //Initializes the XIVAPI
        this.chrProfiles = {};
    }

    //Initialize extension
    async init(guild: Guild) {
        //Check database
        if (this.databaseObject === undefined) {
            this.databaseObject = {chrProfiles: {}};
            this.dbSend();
        }
        
        this.chrProfiles = this.databaseObject.chrProfiles;
    }

    //Commands
    //Registers the queried ffxiv character to the discord user
    async iam(args: string[], message: Message) {
        console.log("Iam");
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
        let searchObject: any;
        try {
            searchObject = await this.xiv.character.search(chrForename + " " + chrSurname, {server: chrServer});
        } catch {
            let embed = createEmbed("The request timed out, please try again.");
            message.channel.send(embed);
            message.channel.stopTyping();
            return;
        }
        //Checks if query contains a single valid result
        let searchResult: any[] = searchObject["Results"];
        if (searchResult.length === 0) {
            let embed = createEmbed("There were no characters with the name **" + chrForename + "** **" + chrSurname + "** on **" + chrServer + "**");
            message.channel.send(embed);
            message.channel.stopTyping();
            return;
        }
        if (searchResult.length > 1) {
            let embed = createEmbed("Hmmm, strange. There were multiple results. Please try again.");
            message.channel.send(embed);
            message.channel.stopTyping();
            return;
        }

        if (searchResult.length === 1) chrProfile = searchResult[0]; //Sets chrProfile if there was only one valid result

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
            getProfile = await this.xiv.character.get(thisChrProfile.ID, {extended: 1, data: "CJ"});
        } catch {
            let embed = createEmbed("The request timed out, please try again.");
            message.channel.send(embed);
            message.channel.stopTyping();
            return;
        }

        let chrProfile = getProfile.Character;

        //Generate response graphics and send it
        let profileEmbed = await this.generateProfileEmbed(chrProfile);
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
                    let thisChrSave: any = this.chrProfiles[users[i].id];
                    let getProfile: any;
                    try {
                        getProfile = await this.xiv.character.get(thisChrSave.ID, {extended: 1, data: "CJ"});
                    } catch {
                        let embed = createEmbed("The request timed out, please try again.");
                        message.channel.send(embed);
                        message.channel.stopTyping();
                        return;
                    }
                
                    let chrProfile: any = getProfile.Character;

                    let embedResponse = await this.generateProfileEmbed(chrProfile);
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
            let chrResult: any;
            
            //Queries for Character
            let searchObject
            try {
                searchObject = await this.xiv.character.search(chrForename + " " + chrSurname, {server: chrServer});
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }

            //Checks if results are valid
            let searchResult: any[] = searchObject["Results"];
            if (searchResult.length === 0) {
                let embed = createEmbed("There were no characters with the name **" + chrForename + "** **" + chrSurname + "** on **" + chrServer + "**");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }
            if (searchResult.length > 1) {
                let embed = createEmbed("Hmmm, strange. There were multiple results. Please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }

            //If results are valid, queries for character information
            if (searchResult.length === 1) chrResult = searchResult[0];
            let getProfile: any;
            try {
                getProfile = await this.xiv.character.get(chrResult.ID, {extended: 1, data: "CJ"});
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }
            
            let chrProfile: any = getProfile.Character;

            //Generates graphivs and response and sends to user
            let embedResponse = await this.generateProfileEmbed(chrProfile);
            message.channel.send(embedResponse);
            message.channel.stopTyping();
        }
    }

    //Returns graphiv with information about characters gear for mention users character, callers character or queried character
    async gear(args: string[], message: Message) {
        let member = message.member as GuildMember;

        //Checks if there are mentioned users;
        let users: User[] = message.mentions.users.array();
        if (users.length !== 0) {
            message.channel.startTyping();
            for (var i in users) {
                if (this.chrProfiles[users[i].id] !== undefined) {
                    let thisChrSave: any = this.chrProfiles[users[i].id];
                    let getProfile: any;
                    //Queries for character information and returns graphics with gear information
                    try {
                        getProfile = await this.xiv.character.get(thisChrSave.ID, {extended: 1, data: "CJ"});
                    } catch {
                        let embed = createEmbed("The request timed out, please try again.");
                        message.channel.send(embed);
                        message.channel.stopTyping();
                        return;
                    }
                    
                    let chrProfile: any = getProfile.Character;

                    let embedResponse = await this.generateGearEmbed(chrProfile);
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
            let chrResult: any;
            let searchObject: any;
            //Query for character
            try {
                searchObject = await this.xiv.character.search(chrForename + " " + chrSurname, {server: chrServer});
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }

            //Chech if results are valid
            let searchResult: any[] = searchObject["Results"];
            if (searchResult.length === 0) {
                let embed = createEmbed("There were no characters with the name **" + chrForename + "** **" + chrSurname + "** on **" + chrServer + "**");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }
            if (searchResult.length > 1) {
                let embed = createEmbed("Hmmm, strange. There were multiple results. Please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }

            //If results are valid, query for character gear information
            if (searchResult.length === 1) chrResult = searchResult[0];

            let getProfile: any;
            try {
                getProfile = await this.xiv.character.get(chrResult.ID, {extended: 1, data: "CJ"});
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }
    
            let chrProfile: any = getProfile.Character;

            //Generate gear graphics and return to user
            let embedResponse = await this.generateGearEmbed(chrProfile);
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
                getProfile = await this.xiv.character.get(thisChrProfile.ID, {extended: 1, data: "CJ"});
            } catch {
                let embed = createEmbed("The request timed out, please try again.");
                message.channel.send(embed);
                message.channel.stopTyping();
                return;
            }

            let chrProfile = getProfile.Character;
            
            //Generate gear graphics and return to user
            let profileEmbed = await this.generateGearEmbed(chrProfile);
            message.channel.send(profileEmbed);
            message.channel.stopTyping();
        }
    }

    //Creates custom image and returns it in an embed
    private async generateProfileEmbed(chrProfile: any) {
        //Implement pretty pretty image system
        var canvas = createCanvas(1280, 873);
        var ctx = canvas.getContext('2d');

        let img: Buffer = await this.getImage(chrProfile.Portrait);
        let profileImg = new Image();
        profileImg.src = img;

        let frame = await loadImage("./extensions/ffxiv_integration/ffxiv_integration_extension/ffxiv_profile_frame.png");

        ctx.drawImage(profileImg, 640, 0);
        ctx.drawImage(frame, 0, 0);

        this.drawText(chrProfile.Name, 320, 100, ctx, {"font": '70px ' + "OPTIEngeEtienne", "alignment": "center"});
        this.drawText(chrProfile.Title.Name, 320, 150, ctx, {"font": '40px ' + ffxivfont, "alignment": "center"});

        this.drawLvlText(chrProfile.ClassJobs, ctx);

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
    private async generateGearEmbed(chrProfile: any) {
        var canvas = createCanvas(2000, 920);
        var ctx = canvas.getContext('2d');
        let gear: any = chrProfile.GearSet;

        let img: Buffer = await this.getImage(chrProfile.Portrait);
        let profileImg = new Image();
        profileImg.src = img;

        let frame = await loadImage("./extensions/ffxiv_integration/ffxiv_integration_extension/ffxiv_gear_frame.png");

        ctx.drawImage(profileImg, 700, 23.5);
        ctx.drawImage(frame, 0, 0);

        let jobTxt = "LVL " + chrProfile.ActiveClassJob.Level + " " + chrProfile.ActiveClassJob.Job.Name;
        this.drawText(jobTxt.toUpperCase(), 1000, 700, ctx, {"font": '40px ' + ffxivfont, "alignment": "center"});
        this.drawText(chrProfile.Name, 1000, 780, ctx, {"font": '70px ' + "OPTIEngeEtienne", "alignment": "center"});
        this.drawText(chrProfile.Title.Name, 1000, 830, ctx, {"font": '40px ' + ffxivfont, "alignment": "center"});

        //Set default drawing coordinates and data
        let x = 600;  //Start X Pos
        let y = 20;   //Start Y pos
        let dx = 720; //Delta between rows
        let dim = 80; //Icon Dimensions
        let off = 50; //Drawing Offset
        let r = 1;    //Starting row
        let drawData: {[data: string]: number} = {"x": x, "y": y, "dx": dx, "dim": dim, "off": off, "r": r};

        await this.drawGearIcons(gear, ctx, drawData);
        await this.drawGearLvl(gear, ctx, drawData);
        await this.drawGearMelds(gear, ctx, drawData);
        await this.drawGearText(gear, ctx, drawData);

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
    private async getImage(URL: string) {
        let image = await getBuffer(URL);
        return image;
    }

    //Draw Generic Text
    private drawText(text: string, x: number, y: number, ctx: any, options?: {[option: string]: any}) {
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
    private drawLvlText(chrClassJobs: any, ctx: any) {
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
    private async drawGearIcons(gear: any, ctx: any, drawData: {[data: string]: number}) {
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
                let img: Buffer = await this.getImage(items[item]);
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
    private async drawGearLvl(gear: any, ctx: any, drawData: {[data: string]: number}) {
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

            this.drawText(items[item], x, y, ctx, {"alignment": alignment, "font": "50px " + ffxivfont, "color": "orange"});

            y = y + dim + off;
        }

    }
    //Draw Gear Melds
    private async drawGearMelds(gear: any, ctx: any, drawData: {[data: string]: number}) {
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
                    let img: Buffer = await this.getImage("https://xivapi.com" + materia.Icon);
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
    private async drawGearText(gear: any, ctx: any, drawData: {[data: string]: number}) {
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

            if (items[item].name !== undefined) this.drawText(items[item].name, x, y, ctx, {"alignment": alignment, "font": "25px " + ffxivfont, "color": "white"});
            if (items[item].mirage !== undefined) this.drawText(items[item].mirage, x, y + 30, ctx, {"alignment": alignment, "font": "25px " + ffxivfont, "color": "orange"});

            y = y + dim + off;
        }

    }
}