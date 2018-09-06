import axios from 'axios';

const CONFIG_URL = 'https://config.review.network/config-rinkeby-mvp.json';

let additionalConfig = {};

export default {
  get config() {
    if (this._config) {
      return Promise.resolve(this._config);
    }

    if (this._configPromise) {
      return this._configPromise;
    }

    this._configPromise = axios
      .get(CONFIG_URL)
      .then(({ data }) => ({
        ...data,
        ...additionalConfig,
      }))
      .then(config => {
        this._config = config;
        return config;
      })
      .catch(err =>
        console.log(err, `Failed to load config from ${CONFIG_URL}`),
      );

    return this._configPromise;
  },
};
