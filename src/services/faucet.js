import axios from 'axios';
import Config from '../config';

class Faucet {
  constructor() {
    this.initURL();
  }

  initURL() {
    Config.config.then(config => {
      this.url = config.FAUCET_API;
    });
  }

  sendETH(toAddress) {
    return axios.get(`${this.url}/request/eth/${toAddress}`);
  }

  sendREW(toAddress) {
    return axios.get(`${this.url}/request/rew/${toAddress}`);
  }
}

export default new Faucet();
