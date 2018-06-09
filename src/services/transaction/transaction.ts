export class Transaction{

    public from: string;
    public to: string;
    public amount: number;
    public hash: string;
    public id: string;

    public constructor(init?:Partial<Transaction>) {
        Object.assign(this, init);
    }
}
