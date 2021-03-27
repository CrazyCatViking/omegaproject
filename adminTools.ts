/*
    AdminTools handles and contains the commands that configure the bot, extensions and permissions.
*/

import { Message } from "discord.js";
import { Extension } from "./extension";
import { CommandManager } from "./commandManager";
import { PermissionManager } from "./permissionManager";
import { ExtensionManager } from "./extensionManager";
import { createEmbed } from "./omegaToolkit";
import { Guild } from "./guild";

//Admin commands and tooltips
const adminCommands = ["setPermissions", "removePermissions", "setAlias", "removeAlias", "enableExtension", "disableExtension", "listExtensions", "setBotCommand"];
const help = {setPermissions: {syntax: "[namespace] [subCommand1... + subCommandN] [@user1... + @userN] [@role1... + @roleN]", tooltip: "Sets permissions for users or roles on the given namespace and subCommands"},
              removePermissions: {syntax: "[namespace] [subCommand1... + subCommandN] [@user1... + @userN] [@role1... + @roleN]", tooltip: "Removes permissions for users or roles on the given namespace and subCommands"},
              setAlias: {syntax: "[alias] [namespace] [subCommand]", tooltip: "Sets an alias for the given sub command on the specified namespace"},
              removeAlias: {syntax: "[alias]", tooltip: "Removes the given alias"},
              enableExtension: {syntax: "[extension1... + extensionN]", tooltip: "Enables the specified extensions"},
              disableExtension: {syntax: "[extension1... + extensionN", tooltip: "Disables the specified extensions"},
              listExtensions: {syntax: "", tooltip: "Lists all extensions"},
              setBotCommand: {syntax: "[newBotCommand]", tooltip: "Changes the bot command to the one specified"}
};

export class AdminTools extends Extension {
    permissionManager: PermissionManager;
    commandManager: CommandManager;
    extensionManager: ExtensionManager;
    guild: Guild;

    constructor(permissionManager: PermissionManager) {
        //Sets initial values
        super();
        this.permissionManager = permissionManager;
        this.commandManager = {} as CommandManager;
        this.extensionManager = {} as ExtensionManager;
        this.guild = {} as Guild;
    }

    //Loads admin commands and tooltips into the commandManager
    loadAdminCommands() {
        this.commandManager.commands["admin"] = adminCommands;
        this.commandManager.tooltips["admin"] = help;
    }

    //Sets permissions for a specified namespace and subCommands
    //SYNTAX: ob!admin setPermissions [namespace] [subCommand1...  subCommandN] [@user1...  @userN] [@role1... @roleN]
    setPermissions(args: string[], message: Message) {
        let namespace = args[0];
        let subCommands = args.slice(1);

        //Check if namespace and subCommands are supplied
        if (namespace === undefined) return;
        if (subCommands === undefined) return;

        //Check if extension exists
        if (this.commandManager.commands[namespace] === undefined && namespace !== "admin") {
            let embed = createEmbed("There are no root commands matching: " + namespace);
            message.channel.send(embed);
            return;
        }
        
        //Remove mentioned users and roles from array of arguments
        for (var i in subCommands) {
            let arrayPos = subCommands.indexOf(i);
            if (subCommands[i].includes("@")) subCommands.splice(arrayPos, 1);
        }

        //Create response text
        let response = "The user permissions for the specified command has been updated.";
        if (subCommands.length === 0) {
            subCommands = this.commandManager.commands[namespace]; //If no subcommands were specified set permissions for all subCommand on the namespace
        } else {
            for (let i in subCommands) {
                //Checks if supplied subCommand exist and removes them if they do not
                let arrayPos = subCommands.indexOf(i);
                if (!this.commandManager.commands[namespace].includes(subCommands[i]) && !adminCommands.includes(subCommands[i])) {
                    subCommands.splice(arrayPos, 1);
                    response = response + " Some of the specified sub commands did not exist and were ignored.";
                }
            }
        }

        this.permissionManager.setPermission(namespace, subCommands, message); //Sets the permissions in the permissionManager

        //Creates and sends response to the channel the command was called from
        let embed = createEmbed(response);
        message.channel.send(embed);
    }

    //Removes permissions for a specified namespace and subCommands
    //SYNTAX: ob!admin removePermissions [namespace] [subCommand1...  subCommandN] [@user1...  @userN] [@role1... @roleN]
    removePermissions(args: string[], message: Message) {
        let namespace = args[0];
        let subCommands = args.slice(1);

        //Check if namespace and subCommands are supplied
        if (namespace === undefined) return;
        if (subCommands === undefined) return;

        //Check if extension exists
        if (this.commandManager.commands[namespace] === undefined && namespace !== "admin") {
            let embed = createEmbed("There are no root commands matching: " + namespace);
            message.channel.send(embed);
            return;
        }

        //Remove user and role mentions from array of argumants
        for (var i in subCommands) {
            let arrayPos = subCommands.indexOf(i);
            if (subCommands[i].includes("@")) subCommands.splice(arrayPos, 1);
        }

        //Set response text
        let response = "The role permissions for the specified command has been updated";

        if (subCommands.length === 0) {
            subCommands = this.commandManager.commands[namespace]; //If no subCommands were supplied, remove permissions for all subCommand on the namespace
        } else {
            for (let i in subCommands) {
                //Check if subCommand exists, remove them if they do not
                let arrayPos = subCommands.indexOf(i);
                if (!this.commandManager.commands[namespace].includes(subCommands[i]) && !adminCommands.includes(subCommands[i])) {
                    subCommands.splice(arrayPos, 1);
                    response = response + " Some of the specified sub commands did not exist and were ignored.";
                }
            }
        }

        this.permissionManager.removePermission(namespace, subCommands, message); //Removes the permissions in the permissionManager

        //Creates and sends response to the channel the command was called from
        let embed = createEmbed("The role permissions for the specified command has been updated");
        message.channel.send(embed);
    }

    //Sets command alias for a specified namespace and subCommand
    //SYNTAX: ob!admin setAlias [alias] [namespace] [subCommand]
    setAlias(args: string[], message: Message) {
        let alias = args[0];
        let namespace = args[1];
        let subCommand = args[2];

        //Check if alias, namespace and subCommand is supplied
        if (alias === undefined || namespace === undefined || subCommand === undefined) return;

        //Checks if alias is registered as a namespace for an extension
        if (this.commandManager.commands[alias] !== undefined) {
            let embed = createEmbed("You can't set the root command of an extension as an alias");
            message.channel.send(embed);
            return;
        }

        //Sets the Alias for the namespace and the command in the commandManager
        this.commandManager.aliases[alias] = {namespace: namespace, subCommand: subCommand};
        this.commandManager.updateDb(); //Updates database

        //Sends response to user in channel the command was called from
        let embed = createEmbed("The Alias: " + alias + " has been set for the command: " + this.commandManager.botCommand + namespace + " " + subCommand);
        message.channel.send(embed);
    }

    //Removes command alias 
    //SYNTAX: ob!admin setAlias [alias]
    removeAlias(args: string[], message: Message) {
        let alias = args[0];

        //Check if alias is supplied
        if (alias === undefined) return;

        delete this.commandManager.aliases[alias]; //Removes alias
        this.commandManager.updateDb(); //Updates database

        //Sends response to user in channel the command was called from
        let embed = createEmbed("The Alias: " + alias + " has been removed");
        message.channel.send(embed);
        return;
    }

    //Sets bot root command eg. "ob!"
    //SYNTAX: ob!admin setBotCommand [newBotCommand]
    setBotCommand(args: string[], message: Message) {
        let botCommand = args[0];
        
        //Checks if botCommand is defined and not empty
        if (botCommand !== undefined || botCommand !== "") {
            this.commandManager.botCommand = botCommand; //Sets new botCommand
            this.guild.databaseObject.botCommand = botCommand; //Update database object
            this.guild.updateSettings(); //updates database

            //Sends response to channel where the command was called from
            let embed = createEmbed("The bot command was updated to: " + botCommand);
            message.channel.send(embed);
            return;
        }

        //Sends response if botCommand was not defined to channel the command was called from
        let embed = createEmbed("Something went wrong, please try again.");
        message.channel.send(embed);
    }

    //Enables a specified extension
    //SYNTAX: ob!admin enableExtension [namespace]
    enableExtension(args: string[], message: Message) {
        let extension = args[0];

        //Check if extension if undefined
        if (extension === undefined) return;

        //Checks if extension exists
        if (this.extensionManager.extensions[extension] !== undefined) {
            //Checks if extension is already enabled
            if (this.extensionManager.extensions[extension].enabled === false) {
                this.extensionManager.enableExtension(extension); //Enables extension
                //Updates databaseobject
                let enabledExtensions = this.guild.databaseObject.enabledExtensions as string[];
                if (!enabledExtensions.includes(extension)) {
                    enabledExtensions.push(extension);
                    this.guild.databaseObject.enabledExtensions = enabledExtensions;
                    this.guild.updateSettings(); //Updates database
                }
                //Sends response to user if the extension was enabled
                let embed = createEmbed("The specified extension has been enabled");
                message.channel.send(embed);
                return;
            } else {
                //Sends response to user if the extension was already enabled
                let embed = createEmbed("The specified extension was already enabled");
                message.channel.send(embed);
                return;
            }
        }

        //Sends response to user if the extension does not exist
        let embed = createEmbed("The specified extension does not exist");
        message.channel.send(embed);
        return;
    }

    //Disables extension
    //SYNTAX: ob!admin [namespace]
    disableExtension(args: string[], message: Message) {
        let extension = args[0];

        //Checks if extension is undefined
        if (extension === undefined) return;

        //Checks if extension exists
        if (this.extensionManager.extensions[extension] !== undefined) {
            //checks if extension is enabled
            if (this.extensionManager.extensions[extension].enabled === true) { 
            this.extensionManager.disableExtension(extension); //Disables extension
            //Updates database object
            let enabledExtensions = this.guild.databaseObject.enabledExtensions as string[];
            if (enabledExtensions.includes(extension)) {
                for (let i in enabledExtensions) {
                    let arrayPos = enabledExtensions.indexOf(i);
                    if (enabledExtensions[i] === extension) {
                        enabledExtensions.splice(arrayPos, 1);
                        break;
                    }
                }
                this.guild.databaseObject.enabledExtensions = enabledExtensions;
                this.guild.updateSettings(); //Updates database
                }
                //Sends response to user if extension was disabled
                let embed = createEmbed("The specified extension has been disabled");
                message.channel.send(embed);
                return;
            } else {
                //Sends response to user if specified extension was already disabled
                let embed = createEmbed("The specified extension was already disabled");
                message.channel.send(embed);
                return;
            }
        }
        //Sends response to user if specified extension does not exist
        let embed = createEmbed("The specified extension does not exist");
        message.channel.send(embed);
        return;
    }

    //Lists available extensions and if they are enabled or disabled
    //SYNTAX: ob!admin listExtensions
    listExtensions(args: string[], message: Message) {
        let extensionList = this.extensionManager.extensions;
        let embedContent: string = "";

        for (let extension in extensionList) {
            embedContent = embedContent + extension + ": ";
            if (this.extensionManager.extensions[extension].enabled) {
                embedContent = embedContent + "enabled\n";
            } else {
                embedContent = embedContent + "disabled\n";
            }
        }
        
        //Sends response to user
        let embed = createEmbed(embedContent);
        message.channel.send(embed);
        return;
    }
}