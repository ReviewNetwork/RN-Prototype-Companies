import { store } from 'rfx-core';

import wallet from './Wallet';
import survey from './Survey';
import user from './User';
import ux from './Ux';

export default store.setup({
  wallet,
  survey,
  user,
  ux,
});
