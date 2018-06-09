export default class KeyPair{
    public public_key: string;
    public private_key: string;

    public constructor(init?:Partial<KeyPair>) {
        Object.assign(this, init);
    }
}