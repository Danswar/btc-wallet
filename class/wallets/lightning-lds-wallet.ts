import { LightningCustodianWallet } from './lightning-custodian-wallet';

export class LightningLdsWallet extends LightningCustodianWallet {
  static type = 'lightningLdsWallet';
  static typeReadable = 'Lightning';

  lnAddress?: string;
  lnurl?: string;
  addressOwnershipProof?: string;

  static create(address: string, lnurl: string, addressOwnershipProof: string): LightningLdsWallet {
    const wallet = new LightningLdsWallet();

    wallet.lnAddress = address;
    wallet.lnurl = lnurl;
    wallet.addressOwnershipProof = addressOwnershipProof;

    return wallet;
  }
}
