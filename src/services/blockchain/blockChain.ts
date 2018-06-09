import Block from "./block";

export default class BlockChain {
    public blocks: Array<Block>;

    public get length(): number { return this.blocks ? this.blocks.length : 0; };
}