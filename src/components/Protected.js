import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import wallet from '../services/wallet';

export default function Protected(Children) {
  @inject('store')
  @observer
  class AuthenticatedComponent extends Component {
    constructor(props) {
      super(props);
      this.store = this.props.store.user;
      const loadedWallet = wallet.reload();
      if (loadedWallet) {
        this.store.authenticate();
      }
    }

    render() {
      const { authenticated, authenticating } = this.store;
      return (
        <div className="authComponent">
          {authenticated ? (
            <Children {...this.props} />
          ) : !authenticating && !authenticated ? (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: this.props.location },
              }}
            />
          ) : null}
        </div>
      );
    }
  }
  return AuthenticatedComponent;
}
