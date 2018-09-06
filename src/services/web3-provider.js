import Web3 from 'web3';
import Config from '../config';

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;
Web3.providers.WebsocketProvider.prototype.sendAsync =
  Web3.providers.WebsocketProvider.prototype.send;

async function getProvider() {
  const config = await Config.config;
  return new Web3.providers.WebsocketProvider(config.NODE_URL);
}

export default getProvider;
