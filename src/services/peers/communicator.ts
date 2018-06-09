import State from "../state/state";
import * as rc from "typed-rest-client/RestClient";
import { Component, Injectable } from "@nestjs/common";

export interface ICommunicator{
    gossipAsync(address: string, state: State): Promise<boolean>;
    getPublicKeyAsync(address: string): Promise<string>;
}

@Injectable()
export class HttpCommunicator implements ICommunicator {

    public async gossipAsync(address: string, state: State): Promise<boolean> {
        let client = this.getClient("http://"+address);
        let response = await client.create("gossip", state);
        return response.statusCode === 200;
    }

    public async getPublicKeyAsync(address: string): Promise<string> {
        let client = this.getClient(address);
        let response = await client.get<string>('pubKey');

        return (response != null && response.statusCode === 200) ? response.result : null;
    }

    private getClient(address): rc.RestClient {
        return new rc.RestClient("skelver-node", address);
    }
}