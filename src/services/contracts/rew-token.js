import Contract from './contract';
import Config from '../../config';

class REWToken extends Contract {
  async ready() {
    let config = await Config.config;
    this.contractAddress = config.REW_ADDRESS;
    this.contractAbiHash = config.rewTokenAbi;
  }
}

export default new REWToken();
