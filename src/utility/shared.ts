import { BaseExtension } from "../baseComponents/baseExtension";
import { IExtensionCommandOptionChoice } from "./types";

const registeredCommandNames: string[] = [];
const commandChoices: IExtensionCommandOptionChoice[] = [];

export const setCommandNames = (extensions: BaseExtension[]) => {
    extensions.forEach((extension) => {
        const names = extension.commands().map(item => item.name);
        registeredCommandNames.push(...names);
    });

    registeredCommandNames.forEach((item) => {
        commandChoices.push({name: item, value: item});
    });
}

export const getCommandNames = () => {
    return registeredCommandNames;
}

export const getCommandChoices = () => {
    return commandChoices;
}