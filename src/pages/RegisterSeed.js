import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import Mnemonic from '../components/Mnemonic';
import Protected from '../components/Protected';

@inject('store')
@Protected
@observer
export default class RegisterSeed extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.wallet;
  }

  continue() {
    this.store.clearMnemonic();
    this.props.history.push('/surveys');
  }

  render() {
    return (
      <div className="page register-seed">
        <div className="page-title-wrap">
          <h1 className="page-title">Seed phrase</h1>
        </div>
        <div className="register-seed-msg">
          <p>
            Your wallet is created. Please save this seed phrase and keep it
            secure. It's the only way to recover your account.
          </p>
        </div>

        <div className="seed-phrase-box">
          <div className="seed-phrase-heading">
            <h4>Seed phrase</h4>
          </div>
          <div className="seed-phrase-body">
            <Mnemonic mnemonic={this.store.mnemonic} />
          </div>
        </div>

        <div className="button-wrap">
          <button type="button" className="btn btn-default">
            Continue
          </button>
        </div>

        {this.props.store.authenticated &&
          !this.props.store.authenticating && <Redirect to="/" />}
      </div>
    );
  }
}
