import * as Discord from "discord.js";

export interface IMessageEmbedOptions {
    description?: string,
    footer?: IFooter,
    author?: IEmbedAuthor,
    color?: Discord.ColorResolvable,
    image?: string,
    thumbnail?: string,
    timestamp?: Date,
    url?: string,
}

interface IEmbedAuthor {
    name: string,
    iconURL?: string,
    url?: string,
}

interface IFooter {
    text: string,
    iconURL: string,
}

export const createDiscordEmbed = (title: string, options?: IMessageEmbedOptions): Discord.MessageEmbed => {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(title);

    if (!options) return embed;
    
    if (!!options.description) embed.setDescription(options.description);
    if (!!options.author) embed.setAuthor(options.author.name, options.author.iconURL, options.author.url);
    if (!!options.color) embed.setColor(options.color);
    if (!!options.footer) embed.setFooter(options.footer.text, options.footer.iconURL);
    if (!!options.image) embed.setImage(options.image);
    if (!!options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (!!options.timestamp) embed.setTimestamp(options.timestamp);
    if (!!options.url) embed.setURL(options.url);

    return embed;
}