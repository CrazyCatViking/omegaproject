import { Message } from "discord.js";
import { Extension } from "../../extension";
import ICanHazDadJokeClient from 'icanhazdadjoke-client';
import { createEmbed, getStringArguments } from "../../omegaToolkit";

export function createExtension() {
    return new Tellmeajoke();
}

class Tellmeajoke extends Extension {
    jokeClient: ICanHazDadJokeClient;

    constructor() {
        super();
        this.jokeClient = new ICanHazDadJokeClient();
    }

    //Handle message event
    async message(message: Message) {
        let args = getStringArguments(message.content.toLowerCase());
        let regex = new RegExp('[' + '.,?!#' + ']', 'g');
        for (let i in args) {
            if (args[i].includes("omega") || args[i].includes("joke") || args[i].includes("lul") || args[i].includes("lol") || args[i].includes("omegalul") || args.includes("omegalol")) args[i] = args[i].replace(regex, '');
        }
    
        if (message.content.toLowerCase() === "omega, tell me a joke" || ((args.includes("omega")) && (args.includes("joke") || args.includes("lul") || args.includes("lol")) || args.includes("omegalul") || args.includes("omegalol"))) {
            let joke = await this.jokeClient.getRandomJoke();
            let embed = createEmbed(joke.joke);
            message.channel.send(embed);
        }
    }
}