import Contract from './contract';
import Config from '../../config';

class ReviewNetwork extends Contract {
  async ready() {
    let config = await Config.config;
    this.contractAddress = config.REVIEW_NETWORK_ADDRESS;
    this.contractAbiHash = config.reviewNetworkAbi;
  }
}

export default new ReviewNetwork();
