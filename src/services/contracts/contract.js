import getWeb3 from '../web3';
import wallet from '../wallet';
import ipfs from '../ipfs';

class Contract {
  constructor() {
    getWeb3().then(web3 => (this.web3 = web3));
  }

  async sendSigned(query) {
    return this.web3.eth.net.getId().then(async networkId => {
      let from = wallet.getMyAddress();
      const encodedABI = query.encodeABI();
      const tx = {
        from,
        to: this.contractAddress,
        gas: 2000000,
        data: encodedABI,
        chainId: networkId,
      };

      const key = await wallet.getMyPrivateKey();

      return this.web3.eth.accounts.signTransaction(tx, key).then(
        signed =>
          new Promise((resolve, reject) => {
            this.web3.eth
              .sendSignedTransaction(signed.rawTransaction)
              .once('confirmation', (confirmationNumber, receipt) => {
                if (receipt.status === '0x0') {
                  reject(receipt);
                } else {
                  console.log('Success!');
                  resolve(true);
                }
              })
              .once('error', error => {
                reject(error);
              });
          }),
      );
    });
  }

  get contract() {
    return this.ready().then(() => {
      if (this.contractInstance) {
        return this.contractInstance;
      }

      const from = wallet.getMyAddress();
      return ipfs
        .get(this.contractAbiHash)
        .then(
          async abi =>
            new this.web3.eth.Contract(abi, this.contractAddress, {
              from,
            }),
        )
        .then(instance => {
          this.contractInstance = instance;
          return this.contractInstance;
        })
        .catch(e => console.log(e));
    });
  }
}

export default Contract;
