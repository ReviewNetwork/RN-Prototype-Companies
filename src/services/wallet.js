import bip39 from 'bip39';
import REWToken from './contracts/rew-token';
import getWeb3 from './web3';
import Config from '../config';
import EthCrypto from 'eth-crypto';

class WalletApi {
  constructor() {
    this.address = null;
  }

  async getTotalTokenAmount(tokensInput) {
    const web3 = await getWeb3();
    const rew = await REWToken.contract;
    const BN = web3.utils.BN;

    let tokens = new BN(tokensInput, 10);
    let ten = new BN(10, 10);
    let decimals = new BN(await rew.methods.decimals().call())

    return tokens.mul(ten.pow(decimals));
  }

  async getTokenAmountFormatted(tokensInput) {
    const web3 = await getWeb3();
    const rew = await REWToken.contract;
    const BN = web3.utils.BN;
    
    let tokens = new BN(tokensInput, 10);
    let ten = new BN(10, 10);
    let decimals = new BN(await rew.methods.decimals().call())
    console.log(tokensInput, tokens.div(ten.pow(decimals)).toNumber())
    return tokens.div(ten.pow(decimals)).toNumber();
  }

  async getMyBalance() {
    const rew = await REWToken.contract;
    const decimals = Number(await rew.methods.decimals().call())

    let balance = Number(await rew.methods.balanceOf(this.getMyAddress()).call())
    return balance / 10**decimals
  }

  getPublicKey(wallet) {
    return EthCrypto.publicKeyByPrivateKey(wallet[0].privateKey);
  }

  getMyAddress() {
    return this.address;
  }

  setMyAddress(address) {
    this.address = address;
  }

  setPrivateKey(key) {
    this.privateKey = key;
  }

  getMyPrivateKey() {
    return this.privateKey;
  }

  getMnemonic() {
    return bip39.generateMnemonic();
  }

  async approveREWs(amount) {
    const config = await Config.config;
    const address = config.REVIEW_NETWORK_ADDRESS;
    const rew = await REWToken.contract;
    let totalAmount = await this.getTotalTokenAmount(amount);
    return REWToken.sendSigned(rew.methods.approve(address, totalAmount));
  }

  // clearing on logout
  async clear() {
    const web3 = await getWeb3();
    this.setPrivateKey('');
    this.setMyAddress('');
    sessionStorage.removeItem(`wallet`);
    await web3.eth.accounts.wallet.clear();
  }

  // reload from sessionStorage
  reload() {
    const wallet = JSON.parse(sessionStorage.getItem('wallet'));
    if (wallet) {
      this.setMyAddress(wallet.address);
      this.setPrivateKey(wallet.privateKey);
    }
    return wallet;
  }

  // load wallet on login
  async load(email, password) {
    try {
      const web3 = await getWeb3();
      const wallet = web3.eth.accounts.wallet.load(password, email)[0];
      this.setMyAddress(wallet.address);
      this.setPrivateKey(wallet.privateKey);
      sessionStorage.setItem(`wallet`, JSON.stringify(wallet));
      return wallet;
    } catch (err) {
      alert('Wrong Credentials!');
    }
  }

  // create wallet on register
  async create(mnemonic, email, password) {
    const web3 = await getWeb3();
    const wallet = web3.eth.accounts.wallet.create(
      1,
      bip39.mnemonicToSeedHex(mnemonic),
    )[0];
    this.setMyAddress(wallet.address);
    this.setPrivateKey(wallet.privateKey);
    web3.eth.accounts.wallet.save(password, email);
    sessionStorage.setItem(`wallet`, JSON.stringify(wallet));
    return wallet;
  }
}

export default new WalletApi();
