export class Transaction{

    public id: string;

    public inputs: Array<Input>;
    public outputs: Array<Output>;

    public constructor(init?:Partial<Transaction>) {
        Object.assign(this, init);
    }
}

export class Input{
    public transactionId: string;
    public outputIndex: number;
    public amount: number;

    public constructor(init?:Partial<Input>) {
        Object.assign(this, init);
    }
}

export class Output{
    public to: string;
    public amount: number;

    public constructor(init?:Partial<Output>) {
        Object.assign(this, init);
    }
}