/*
    The Guild module and class handles individual discord guilds/server and all information related to them.
    All guilds get their own instance of the guild class with their own instances of extensions and managers,
    to isolate all information between the different guilds.
*/

import Discord = require('discord.js');
import { CommandManager } from './commandManager';
import { ExtensionManager } from './extensionManager';
import { DatabaseManager } from './databaseManager';
import { PermissionManager } from './permissionManager';
import { AdminTools } from './adminTools';

export class Guild {
    id: string; //The Discord unique guild/server id
    guild: Discord.Guild; //The corresponding Discord guild object
    databaseManager: DatabaseManager; //The guilds database manager
    permissionManager: PermissionManager; //The guilds permission manager
    commandManager: CommandManager; //The guilds command manager
    extensionManager: ExtensionManager; //The guilds extension manager
    adminTools: AdminTools; //The guilds instance of the adminTool that handles configuration of the bot and permissions

    databaseObject: {[dataType: string]: {}}; //DatabaseObject for simple syncronization of local data and data stored in the database
    
    constructor(id: string, guild: Discord.Guild) {
        //Loads guild and all corresponding modules
        this.id = id;
        this.guild = guild;
        this.databaseManager = new DatabaseManager(this.id);
        this.permissionManager = new PermissionManager(this.databaseManager);
        this.adminTools = new AdminTools(this.permissionManager);
        this.commandManager = new CommandManager(this.adminTools, this.databaseManager);
        this.extensionManager = new ExtensionManager(this.commandManager, this.databaseManager);
        
        //Loads admin tools
        this.adminTools.commandManager = this.commandManager;
        this.adminTools.extensionManager = this.extensionManager;
        this.adminTools.guild = this;

        this.databaseObject = {};
    }

    async init() {
        //Initializes all managers and modules
        await this.databaseManager.init();
        await this.permissionManager.init();
        await this.commandManager.init();
        await this.extensionManager.init(this.guild);

        //Get guild settings from the database
        let document = await this.databaseManager.fetchDocument("settings");
        if (document === undefined) {
            this.databaseObject = {botCommand: "ob!", enabledExtensions: []};
            await this.databaseManager.sendDocument("settings", this.databaseObject);
        } else {
            this.databaseObject = document;
        }

        //Set guild settings retrieved from the database
        this.commandManager.botCommand = this.databaseObject.botCommand as string;
        let enabledExtensions = this.databaseObject.enabledExtensions as string[];
        for (let i in enabledExtensions) {
            if (this.extensionManager.extensions[enabledExtensions[i]] !== undefined) this.extensionManager.enableExtension(enabledExtensions[i]);
        }

        //Create DB Change Stream
        this.databaseManager.registerChangeStream("guild", "settings");
        this.databaseManager.on("guild", async () => {
            let document = await this.databaseManager.fetchDocument("settings");
            if (document) {
                this.databaseObject = document;
                this.commandManager.botCommand = document.botCommand;
                let enabledExtensions = document.enabledExtensions;
                for (let i in enabledExtensions) {
                    if (this.extensionManager.extensions[enabledExtensions[i]] !== undefined) this.extensionManager.enableExtension(enabledExtensions[i]);
                }
            }
        });
    }

    //Synchronizes database with the latest databaseObject
    async updateSettings() {
        this.databaseManager.updateDocument("settings", this.databaseObject);
    }

    //Discord events
    //Handles the 'message' event and forwards it to extensions registered for the event
    message(message: Discord.Message) {
        //Check for legacy command
        this.commandManager.resolveCommand(this.permissionManager, this.extensionManager, message);

        //Forward event to extensions
        let extensionList = this.extensionManager.events['message'];
        for (let i in extensionList) {
            let namespace: string = extensionList[i];
            this.extensionManager.extensions[namespace].message(message);
        }
    }

    //Handles the 'reactionAdd' event and forwards it to extensions registered for the event
    reactionAdd(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) {
        let extensionList = this.extensionManager.events['reactionAdd'];
        for (let i in extensionList) {
            let namespace: string = extensionList[i];
            this.extensionManager.extensions[namespace].reactionAdd(reaction, user);
        }
    }

    //Handles the 'reactionRemove' event and forwards it to extensions registered for the event
    reactionRemove(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) {
        let extensionList = this.extensionManager.events['reactionRemove'];
        for (let i in extensionList) {
            let namespace: string = extensionList[i];
            this.extensionManager.extensions[namespace].reactionRemove(reaction, user);
        }
    }

    //Handles the 'messageDelete' event and forwards it to extensions registered for the event
    messageDelete(message: Discord.Message | Discord.PartialMessage) {
        let extensionList = this.extensionManager.events['messageDelete'];
        for (let i in extensionList) {
            let namespace: string = extensionList[i];
            this.extensionManager.extensions[namespace].messageDelete(message);
        }   
    }
}


