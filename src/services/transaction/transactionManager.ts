import { Inject, Component } from "@nestjs/common";
import { IStateManager } from "../state/stateManager";
import {Transaction} from "./transaction";
import DI from "../../di";
import * as _ from "lodash";

export interface ITransactionManager{
    addTransaction(transaction: Transaction): void;
    mergeTransactions(transactions: Array<Transaction>): void;
}

@Component()
export class TransactionManager implements ITransactionManager{

    private readonly _stateManager: IStateManager;
    private _transactions: Array<Transaction>;

    constructor(@Inject(DI.IStateManager) stateManager: IStateManager) {
        this._transactions = new Array<Transaction>();
        this._stateManager = stateManager;
    }

    public addTransaction(transaction: Transaction): void {
        //TODO: Validate

        this._transactions.push(transaction);
        this._stateManager.updateTransactions(this._transactions);
    }

    public mergeTransactions(transactions: Array<Transaction>): void {
        //TODO: validate this

        this._transactions = _.union(this._transactions, transactions);
    }
}