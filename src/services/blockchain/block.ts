import {Transaction} from "../transaction/transaction";

export default class Block{
    public hash: string;
    public prevHash: string;
    public transactions: Array<Transaction>;

    public constructor(init?:Partial<Block>) {
        Object.assign(this, init);
    }
}