import { BaseExtension } from "../baseComponents/baseExtension";
import { IExtensionCommandOptionChoice } from "./types";

const commandNames: Map<string, string[]> = new Map();
const commandChoices: Map<string, IExtensionCommandOptionChoice[]> = new Map(); 

export const useCommandNames = (guildHashId: string) => {
    const setCommandNames = (extensions: BaseExtension[]) => {
        const registeredCommandNames: string[] = [];
        const registeredCommandChoices: IExtensionCommandOptionChoice[] = [];

        extensions.forEach((extension) => {
            const names = extension.commands().map(item => item.name);
            registeredCommandNames.push(...names);
        });

        registeredCommandNames.forEach((item) => {
            registeredCommandChoices.push({name: item, value: item});
        });

        commandNames.set(guildHashId, registeredCommandNames);
        commandChoices.set(guildHashId, registeredCommandChoices);
    };

    const getCommandNames = () => {
        return commandNames.get(guildHashId);
    };

    const getCommandChoices = () => {
        return commandChoices.get(guildHashId);
    };

    return {
        setCommandNames,
        getCommandChoices,
        getCommandNames,
    };
};