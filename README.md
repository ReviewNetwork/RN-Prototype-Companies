# Review.Network Company MVP

## Build for production

1. Copy `utilities/eth-ecies.js` to `node_modules/eth-ecies`
2. `cd node_modules/eth-crypto/node_modules/eth-lib`, then `yarn`, then create `.babelrc` with

```
{
  "presets": ["es2015"]
}
```

then `yarn build`

## Note - Must be done again if you re-install `node_modules`