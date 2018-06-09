export default class NodeInfo{
    public address: string;
    public name: string;
    public faulty: boolean;
    
    public constructor(init?:Partial<NodeInfo>) {
        Object.assign(this, init);
    }
}