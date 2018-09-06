import axios from 'axios';
import Config from '../config';

class Ipfs {
  constructor() {
    Config.config.then(config => {
      let {
        ipfsStore: {
          IPFS_PROTOCOL: protocolStore,
          IPFS_HOST: hostStore,
          IPFS_PORT: portStore,
          IPFS_ROOT: rootStore,
          IPFS_VERSION: versionStore,
        },
        ipfsRead: {
          IPFS_PROTOCOL: protocolRead,
          IPFS_HOST: hostRead,
          IPFS_PORT: portRead,
          IPFS_ROOT: rootRead,
        },
      } = config;

      this.apiStore = {
        protocol: protocolStore,
        host: hostStore,
        port: portStore,
        root: rootStore,
        version: versionStore,
      };

      this.apiRead = {
        protocol: protocolRead,
        host: hostRead,
        port: portRead,
        root: rootRead,
      };

      this.cacheUploadUrl = config.CACHE_UPLOAD_URL;
    });
  }

  store(json) {
    return this.request({
      method: 'POST',
      url: '/add',
      payload: json,
    }).then(
      ipfsHash =>
        axios({
          url: this.cacheUploadUrl,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          data: {
            ipfsHash,
            jsonFile: json
          },
        })
        .then(r => ipfsHash)
    );
  }

  get(hash) {
    return this.requestFile({ url: `/${hash}` });
  }

  setProvider(opts) {
    if (typeof opts === 'object' && !opts.host) {
      return;
    }
    this.api = opts;
  }

  getApiUrl(path) {
    const { protocol, host, port, root = '', version = '' } = this.apiStore;
    return `${protocol}://${host}${
      port ? `:${port}` : ''
    }${root}${version}${path}`;
  }

  getFileUrl(path) {
    const { protocol, host, port, root = '' } = this.apiRead;
    return `${protocol}://${host}${port ? `:${port}` : ''}${root}${path}`;
  }

  request({ method = 'POST', url, payload }) {
    const fullUrl = this.getApiUrl(url);
    return axios({
      url: fullUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method,
      data: payload,
    }).then(response => response.headers['ipfs-hash']);
  }

  requestFile({ url, payload }) {
    const fullUrl = this.getFileUrl(url);
    return fetch(fullUrl, {
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
      body: JSON.stringify(payload),
    })
      .then(response => response.blob())
      .then(
        response =>
          new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(JSON.parse(reader.result || 'null'));
            };
            reader.readAsText(response);
          }),
      )
      .catch(e => console.log('ipfs error', url, e));
  }
}

export default new Ipfs();
