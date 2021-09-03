import Hashids from 'hashids';

const guildHashIds = new Hashids('thegreatbigtreeburntandfell');

export const encode = (id: string) => {
    return guildHashIds.encode(BigInt(id));
};

export const decode = (hashid: string) => {
    return guildHashIds.decode(hashid);
}