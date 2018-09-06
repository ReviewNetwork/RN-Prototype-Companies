import { observable, action } from 'mobx';
import wallet from '../services/wallet';

export default class Wallet {
  @observable mnemonic;
  @observable wallet;
  @observable creatingWallet;

  constructor() {
    this.mnemonic = '';
    this.wallet = null;
    this.creatingWallet = false;
  }

  @action
  async createWallet(email, password) {
    this.creatingWallet = true;
    localStorage.setItem('email', email);
    return new Promise(resolve => {
      setTimeout(async () => {
        this.mnemonic = wallet.getMnemonic();
        this.wallet = await wallet.create(this.mnemonic, email, password);
        this.creatingWallet = false;
        resolve(this.wallet);
      });
    });
  }

  @action
  clearMnemonic() {
    this.mnemonic = '';
  }
}
