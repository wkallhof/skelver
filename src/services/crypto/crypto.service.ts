import KeyPair from "./keypair";
import * as Rsa from "node-rsa";
import * as crypto from "crypto";
import { Component, Injectable } from "@nestjs/common";
    
export interface ICryptoService{
    privateKey: string;
    publicKey: string;
    publicKeyHash: string;
    generateKeyPairAsync(): Promise<void>;
    signAsync(plainText: string, privateKey: string): Promise<string>;
    decryptAsync(cypherText:string, publicKey:string): Promise<string>;
    validateAsync(message: string, cypherText: string, publicKey: string): Promise<boolean>;
    hash(data: string): string;
}

@Injectable()
export class RsaCryptoService implements ICryptoService {
    public privateKey: string;
    public publicKey: string;
    public publicKeyHash: string;

    generateKeyPairAsync(): Promise<void> {

        return new Promise((resolve, reject) => {
            let key = new Rsa({ b: 2048 });
            this.privateKey = key.exportKey("private");
            this.publicKey = key.exportKey("public");
            this.publicKeyHash = this.hash(this.publicKey);
            resolve();
        });
        
    }

    signAsync(plainText: string, privateKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let rsa = this.rsaFromKey(privateKey, "private");
            resolve(rsa.encryptPrivate(plainText, "base64"));
        });
    }

    decryptAsync(cypherText:string, publicKey:string): Promise<string> {
        return new Promise((resolve, reject) => {
            let rsa = this.rsaFromKey(publicKey, "public");
            resolve(rsa.decryptPublic(cypherText, "utf8"));
        });
    }

    async validateAsync(message:string, cypherText:string, publicKey:string): Promise<boolean> {
        return message === await this.decryptAsync(cypherText, publicKey);
    }

    hash(data: string): string{
        return crypto.createHash("sha256").update(data).digest("hex");
    }

    private rsaFromKey(key: string, format: any) {
        let rsa = new Rsa();
        rsa.importKey(key, format);
        return rsa;
    }
}

