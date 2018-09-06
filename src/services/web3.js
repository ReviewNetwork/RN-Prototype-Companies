import Web3 from 'web3';
import getProvider from './web3-provider';

let web3;
let providerPromise;

async function getWeb3() {
  if (web3) {
    return Promise.resolve(web3);
  }

  if (providerPromise) {
    return providerPromise;
  }

  providerPromise = await getProvider();
  const provider = await providerPromise;
  web3 = new Web3(provider);
  return Promise.resolve(web3);
}

export default getWeb3;
