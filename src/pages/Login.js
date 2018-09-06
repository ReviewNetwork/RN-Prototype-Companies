import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';

@inject('store')
@observer
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.user;
    this.state = {
      email: '',
      password: '',
    };
  }

  handleInputChange = (e, stateProp) => {
    this.setState({ [stateProp]: e.target.value });
  };

  login = async e => {
    e.preventDefault();
    const { email, password } = this.state;
    this.setState({ email: '', password: '' });
    try {
      await this.store.login(email, password);
    } catch (err) {
      console.log('nooooooooo');
    }
  };

  render() {
    return (
      <form onSubmit={this.login}>
        <div className="login-register card">
          <div>
            <h2 className="card-title">Login</h2>
          </div>
          <div className="login-form-wrap">
            <div className="form-group">
              <input
                required="required"
                type="email"
                onChange={e => this.handleInputChange(e, 'email')}
                value={this.state.email}
              />
              <label htmlFor="input" className="control-label">
                Email
              </label>
              <i className="bar" />
            </div>
            <div className="form-group">
              <input
                required="required"
                type="password"
                minlength="6"
                onChange={e => this.handleInputChange(e, 'password')}
                value={this.state.password}
              />
              <label htmlFor="input" className="control-label">
                Password
              </label>
              <i className="bar" />
            </div>
            <div>
              <button className="card-btn card-btn-linear" type="submit">
                Login
              </button>
            </div>
            {this.store.authenticated &&
              !this.store.authenticating && <Redirect to="/" />}
          </div>
        </div>
      </form>
    );
  }
}
