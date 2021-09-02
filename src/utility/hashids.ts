import Hashids from 'hashids';

const hashids = new Hashids('thegreatbigtreeburntandfell');

export const encode = (id: number) => {
    return hashids.encode(id);
};

export const decode = (hashid: string) => {
    return hashids.decode(hashid);
}