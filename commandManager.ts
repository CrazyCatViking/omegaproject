/*
    Module and class taht handles command interactions from discord and forwards them to the correct extensions.
    Checks permissions using the permissionManager and handles aliases and adminTools.
    Will handle the new interaction API and slash commands coming to the Discord API in the near future.
    Currently only supports legacy commands (Commands executed by sending a discord message with the correct root bot command)
*/

import Discord = require('discord.js');
import { ExtensionManager } from './extensionManager';
import { createEmbed, getStringArguments } from './omegaToolkit';
import { PermissionManager } from './permissionManager';

import { AdminTools } from './adminTools';
import { DatabaseManager } from './databaseManager';

export class CommandManager {
    botCommand: string //For legacy command support
    commands: {[namespace: string]: string[]}; //Stores commands indexed by extension namespace
    tooltips: {[namespace: string]: {[subCommand: string]: {syntax: string, tooltip: string}}}; //Stores command tooltips for use with the help command
    aliases: {[alias: string]: {namespace: string, subCommand: string}}; //Stores command aliases that can be set by the user
    adminTools: AdminTools; //The adminTools used for managing permissions and bot configuration.
    databaseManager: DatabaseManager; //Reference to the guilds database manager

    databaseObject: {[dataType: string]: {}};

    constructor(adminTools: AdminTools, databaseManager: DatabaseManager) {
        //Initializes command manager and sets initial values.
        this.botCommand = 'ob!';
        this.commands = {};
        this.tooltips = {};
        this.aliases = {};
        this.adminTools = adminTools;
        this.databaseManager = databaseManager;
        this.databaseObject = {};
    }

    async init() {
        //Load the adminTools commands
        this.adminTools.loadAdminCommands();
        
        //Fetch the commandManager databaseObject from the database
        let document = await this.databaseManager.fetchDocument("commandManager");
        if (document === undefined) {
            //If databaseObject is missing, initialize new one and send it to the database
            this.databaseObject = {aliases: {}, commands: {}};
            await this.databaseManager.sendDocument("commandManager", this.databaseObject);
        } else {
            //Set local databaseObject to the one fetched from the database
            this.databaseObject = document;
        }

        //Loads command aliases
        this.aliases = this.databaseObject.aliases;
    } 

    //Legacy Command System, handles commands from messages with the correct root bot command
    resolveCommand(permissionManager: PermissionManager, extensionManager: ExtensionManager, message: Discord.Message) {
        //Check for bot command
        let botCommand = message.content.substring(0, this.botCommand.length);
        if (botCommand !== this.botCommand) return;

        //Convert raw string to array containing single arguments
        let args: string[] = getStringArguments(message.content.substring(this.botCommand.length));
        let namespace = args[0]; //Extension namespace
        let subCommand: string = args[1]; //Extension subCommand
        let commandArgs: string[] = args.slice(2); //Command arguments

        //Handles the special case for use of the help command
        if (namespace === "help") {
            this.help(subCommand, commandArgs, message, permissionManager, extensionManager);
            return;
        }

        //Check if user has set a command alias
        let aliasCheck = this.checkAlias(namespace);
        if (aliasCheck !== undefined) {
            namespace = aliasCheck.namespace;
            subCommand = aliasCheck.subCommand;
            commandArgs = args.slice(1);
        } else {
            //Check if casing is correct for namespace and subCommand if there are no aliases
            namespace = this.checkNamespace(namespace);
            if (this.commands[namespace] === undefined) return;

            subCommand = this.checkSubCommand(namespace, subCommand);
            if (!this.commands[namespace].includes(subCommand)) return;

            commandArgs = args.slice(2);
        }

        //Handles the special case for adminTool commands
        if (namespace === "admin" && this.adminTools !== undefined) {
            //Checks if the user who called the command has permissions to use it
            if (!permissionManager.resolvePermissions(namespace, subCommand, message.member as Discord.GuildMember)) return; 
            
            //Forwards the command to the adminTools
            let adminTools = this.adminTools as any;
            adminTools[subCommand](commandArgs, message);
            return;
        }
        
        //Handles normal commands
        if (!extensionManager.extensions[namespace].enabled) return; //Checks if the specified extension is enabled
        if (!permissionManager.resolvePermissions(namespace, subCommand, message.member as Discord.GuildMember)) return; //Checks if user has permissions to use the called command

        //Forwards the command to the corresponding extension
        let extension = extensionManager.extensions[namespace] as any;
        extension[subCommand](commandArgs, message);
    }

    //Checks if letter casing is correct, gets correct casing if needed
    checkNamespace(_namespace: string) {
        let namespace: string = _namespace;

        let lwrCaseNamespace = namespace.toLowerCase();
        for (let key in this.commands) {
            let lwrCaseKey = key.toLowerCase();
            if (lwrCaseNamespace === lwrCaseKey) {
                namespace = key;
                break;
            }
        }

        return namespace;
    }

    //Checks if letter casing is correct, gets correct casing if needed
    checkSubCommand(_namespace: string, _subCommand: string) {
        let subCommand = _subCommand;
        
        let lwrCaseSubCommand = subCommand.toLowerCase();
        let commands: string[] = this.commands[_namespace];
        for (let i in commands) {
            let lwrCaseCommand = commands[i].toLowerCase();
            if (lwrCaseSubCommand === lwrCaseCommand) {
                subCommand = commands[i];
                break;
            }
        }

        return subCommand;
    }

    //Checks for aliases
    checkAlias(_namespace: string): {namespace: string, subCommand: string} | undefined {
        let namespace: string = _namespace;
        let subCommand: string;

        if (this.aliases[namespace] === undefined) {
            for (let alias in this.aliases) {
                let lwrCaseAlias = alias.toLowerCase();
                let lwrCaseNamespace = namespace.toLowerCase();
                if (lwrCaseNamespace === lwrCaseAlias) {
                    namespace = alias;
                    break;
                }
            }
        }

        if (this.aliases[namespace] !== undefined) {
            //Sets the correct subCommand and namespace if the command uses a user defined alias
            subCommand = this.aliases[namespace].subCommand; 
            namespace = this.aliases[namespace].namespace;
            return {"namespace": namespace, "subCommand": subCommand};
        } else {
            return undefined;
        }
    }

    //Help command for information regarding use of the bot and it's extensions
    //SYNTAX: ob!admin help [namespace]
    help(subCommand: string, commandArgs: string[], message: Discord.Message, permissionManager: PermissionManager, extensionManager: ExtensionManager) {
        //Create object containing extensions and commands available to the specific user
        let extensions: {[extension: string]: string[]} = {};
        for (let namespace in this.commands) {
            let commands: string[] = [];

            //Checks for permissions per namespace and command
            for (let i in this.commands[namespace]) {
                if (permissionManager.resolvePermissions(namespace, this.commands[namespace][i], message.member as Discord.GuildMember)) {
                    commands.push(this.commands[namespace][i]);
                }

                if (namespace !== "admin") {
                    if (commands.length !== 0 && extensionManager.extensions[namespace].enabled && this.tooltips[namespace] !== undefined) extensions[namespace] = commands;
                } else {
                    if (commands.length !== 0) extensions[namespace] = commands; 
                }
            }
        }

        //Checks if user has specified an extension to get more information on, if not, send general help message, with list of the extensions available to the specific user
        if (subCommand === undefined) {
            let title = "**Welcome to the Omega help-desk:**";
            let content = "To use the help desk,\n run `" + this.botCommand + "help [extension root command]` to get information on how to use extensions.\n\n The following are the extensions available to you:\n\n";

            //Add extension namespaces to list in the response
            for (let extension in extensions) {
                content = content + "`" + extension + "`\n";
            }

            //Create and send response
            let embed = createEmbed(content, {title: title}); //Creates a new message embed with the supplied title and content
            message.channel.send(embed); //Sends embed in a message to the channel the user sent the command from

            return;
        }

        //Checks if supplied namespace exists
        if (extensions[subCommand] === undefined) return;

        //Generate response
        let title = "**Help-desk for " + subCommand + "**";
        let content = "";
        let commands = extensions[subCommand];
        
        //Generate command tooltips
        for (let i in commands) {
            let command = commands[i];
            if (this.tooltips[subCommand] !== undefined) {
                if (this.tooltips[subCommand][command] !== undefined) {
                    content = content + this.tooltips[subCommand][command].tooltip + "\n";
                    content = content + "`" + this.botCommand + subCommand + " " + command + " " + this.tooltips[subCommand][command].syntax + "`\n\n"
                }
            }
        }

        //Create and send response
        let embed = createEmbed(content, {title: title}); //Creates a new message embed with the supplied title and content
        message.channel.send(embed); //Sends embed in a message to the channel the user sent the command from
    }

    //Updates the databaseObject on the database with a new locally stored one
    updateDb() {
        this.databaseObject.aliases = this.aliases;
        this.databaseObject.commands = this.commands;
        this.databaseManager.updateDocument("commandManager", this.databaseObject);
    }

    //Slash Command System comes here
}