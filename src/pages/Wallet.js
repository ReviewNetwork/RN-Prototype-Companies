import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import wallet from '../services/wallet';
import getWeb3 from '../services/web3';
import faucet from '../services/faucet';
import Protected from '../components/Protected';

let web3;

@Protected
@inject('store')
@observer
export default class Wallet extends Component {
  state = {
    ethBalance: 0,
    rewBalance: 0,
    address: '',
  };

  _mounted = false;

  async componentDidMount() {
    this._mounted = true;
    this.props.store.ux.changeLoadingText('Loading Wallet...');
    this.props.store.ux.changeLoadingTo(true);
    await this.updateData();
    this.props.store.ux.changeLoadingText('');
    this.props.store.ux.changeLoadingTo(false);
  }

  async updateData() {
    web3 = await getWeb3();
    const eths = await web3.utils.fromWei(
      await web3.eth.getBalance(wallet.getMyAddress()),
    );
    const rews = await wallet.getMyBalance();
    if (this._mounted) {
      this.setState({
        ethBalance: eths,
        rewBalance: rews,
        address: wallet.getMyAddress(),
      });
    }
  }

  requestREW = () => {
    this.props.store.ux.changeLoadingText('Getting REW...');
    this.props.store.ux.changeLoadingTo(true);
    faucet
      .sendREW(this.state.address)
      .then(res => {
        if (res.data.error) {
          throw Error(res.data.error);
        }

        this.setState(
          ({ rewBalance }) => ({
            rewBalance: Number(rewBalance) + Number(res.data.amount),
          }),
          () => {
            this.props.store.ux.changeLoadingText('');
            this.props.store.ux.changeLoadingTo(false);
          },
        );
      })
      .catch(err => {
        this.props.store.ux.changeLoadingText('');
        this.props.store.ux.changeLoadingTo(false);
        console.log(err, 'failed to receive rews');
        // alert('Something went wrong :(')
        alert(err);
      });
  };

  requestETH = () => {
    this.props.store.ux.changeLoadingText('Getting ETH...');
    this.props.store.ux.changeLoadingTo(true);
    faucet
      .sendETH(this.state.address)
      .then(res => {
        if (res.data.error) {
          throw Error(res.data.error);
        }

        this.setState(
          ({ ethBalance }) => ({
            ethBalance: Number(ethBalance) + Number(res.data.amount),
          }),
          () => {
            this.props.store.ux.changeLoadingText('');
            this.props.store.ux.changeLoadingTo(false);
          },
        );
      })
      .catch(err => {
        this.props.store.ux.changeLoadingText('');
        this.props.store.ux.changeLoadingTo(false);
        // alert('Something went wrong :(');
        alert(err);
        console.log(err, 'failed to receive eth');
      });
  };

  onCopy() {
    console.log('Copied to clipboard!');
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  render() {
    return (
      <div className="wallet">
        {/* Wallet Page
        <h3>Address:</h3>
         */}

        <div className="card card-dark">
          <h2 className="wallet-title">Your Balance</h2>
          <p className="wallet-balance">
            {this.state.rewBalance.toLocaleString()} REW
          </p>
          <p className="wallet-balance">{this.state.ethBalance} ETH</p>
          <p className="wallet-address">
            <span
              style={{
                fontSize: '16px',
                marginRight: '8px',
                fontFamily: 'monospace',
              }}
            >
              {this.state.address}
            </span>
            <CopyToClipboard text={this.state.address} onCopy={this.onCopy}>
              <span>
                <i className="material-icons">filter_none</i>
              </span>
            </CopyToClipboard>
          </p>
        </div>

        <div className="card faucet">
          <h3 className="card-title">Faucet</h3>

          <p className="faucet-text">
            You can top-up on ETH and REW here.{' '}
            <strong>You need both to use the application.</strong>
          </p>

          <h3 className="card-subtitle">Why do I need this?</h3>

          <ul className="list-styled">
            <li>You need ETH to be able to send transactions</li>
            <li>You need REW to fund your market research campaigns</li>
          </ul>

          <div className="request-buttons">
            <div className="card group-half-wrap">
              <div className="group-half card-btn-wrap">
                <button
                  className="card card-btn card-btn-linear"
                  onClick={this.requestREW}
                >
                  Request REW
                </button>
              </div>

              <div className="group-half card-btn-wrap">
                <button
                  className="card card-btn card-btn-linear"
                  onClick={this.requestETH}
                >
                  Request ETH
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
