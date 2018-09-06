import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import Loadable from 'react-loadable';
import { Loader } from 'react-overlay-loader';
import Navbar from './components/Navbar';

const Loading = () => (
  <Loader
    fullPage
    loading={true}
    containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    textStyle={{ color: 'rgb(255, 255, 255)' }}
  />
);

const MarketResearch = Loadable({
  loader: () => import('./pages/MarketResearch'),
  loading: Loading,
});

const Login = Loadable({
  loader: () => import('./pages/Login'),
  loading: Loading,
});

const Register = Loadable({
  loader: () => import('./pages/Register'),
  loading: Loading,
});

const Wallet = Loadable({
  loader: () => import('./pages/Wallet'),
  loading: Loading,
});

const AccountSettings = Loadable({
  loader: () => import('./pages/AccountSettings'),
  loading: Loading,
});

const RegisterSeed = Loadable({
  loader: () => import('./pages/RegisterSeed'),
  loading: Loading,
});

const CreateSurvey = Loadable({
  loader: () => import('./pages/CreateSurvey'),
  loading: Loading,
});

const NotFound = Loadable({
  loader: () => import('./pages/NotFound'),
  loading: Loading,
});

@withRouter
@inject('store')
@observer
export default class App extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.ux;
  }

  render() {
    return (
      <div className="wrapper">
        {/* <DevTools /> */}
        <Navbar />
        <Loader
          fullPage
          loading={this.store.isLoading}
          containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          textStyle={{ color: 'rgb(255, 255, 255)' }}
          text={this.store.loadingText || 'Loading...'}
        />
        <div className="container">
          <Switch>
            <Route exact path="/" component={MarketResearch} />
            <Route exact path="/wallet" component={Wallet} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/create" component={CreateSurvey} />
            <Route exact path="/register/seed" component={RegisterSeed} />
            <Route exact path="/settings" component={AccountSettings} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <footer>
          Copyright &copy; Review.Network {new Date().getFullYear()}
          &nbsp;• All rights reserved.
        </footer>
      </div>
    );
  }
}
