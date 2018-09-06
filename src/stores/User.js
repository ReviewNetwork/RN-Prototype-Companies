import { observable, action } from 'mobx';
import wallet from '../services/wallet';

export default class User {
  @observable authenticated;
  @observable authenticating;

  constructor() {
    this.authenticated = false;
    this.authenticating = false;
  }

  @action
  async logout() {
    await wallet.clear();
    this.authenticated = false;
    localStorage.removeItem('email');
  }

  @action
  authenticate() {
    this.authenticated = true;
  }

  @action
  async login(email, password) {
    this.authenticating = true;
    localStorage.setItem('email', email);
    return new Promise(resolve => {
      setTimeout(async () => {
        const loadedWallet = await wallet.load(email, password);
        if (loadedWallet) {
          this.authenticating = false;
          this.authenticated = true;
        }
        resolve();
      }, 0);
    });
  }
}
