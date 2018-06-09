import NodeInfo from "../peers/nodeInfo";
import BlockChain from "../blockchain/blockchain";
import {Transaction} from "../transaction/transaction";

export default class State{
    public blockchain: BlockChain = new BlockChain();
    public peers: Array<NodeInfo> = new Array<NodeInfo>();
    public transactions: Array<Transaction> = new Array<Transaction>();
    public node: NodeInfo = new NodeInfo();
    public difficulty: number = 5;

    public constructor(init?:Partial<State>) {
        Object.assign(this, init);
    }
}