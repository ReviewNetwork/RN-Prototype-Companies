import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
export default class Register extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.wallet;
    this.state = {
      email: '',
      name: '',
      password: '',
    };
  }

  handleInputChange = (e, stateProp) => {
    this.setState({ [stateProp]: e.target.value });
  };

  createWallet = async e => {
    e.preventDefault();
    const { password, email, name } = this.state;
    this.setState({
      email: '',
      name: '',
      password: '',
    });
    localStorage.setItem(`${email}_name`, name);
    await this.store.createWallet(email, password);
    this.props.store.user.authenticate();
    this.props.history.push('/');
  };

  render() {
    return (
      <form onSubmit={this.createWallet}>
        <div className="login-register card">
          <div>
            <h2 className="card-title">Register</h2>
          </div>
          <div className="login-form-wrap">
            <div className="form-group">
              <input
                type="email"
                required="required"
                onChange={e => this.handleInputChange(e, 'email')}
                value={this.state.email}
              />
              <label htmlFor="input" className="control-label">
                Company Email
              </label>
              <i className="bar" />
            </div>
            <div className="form-group">
              <input
                type="text"
                minlength="3"
                required="required"
                onChange={e => this.handleInputChange(e, 'name')}
                value={this.state.name}
              />
              <label htmlFor="input" className="control-label">
                Company Name
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
                Register
              </button>
              {this.store.creatingWallet && <span>Creating the wallet...</span>}
            </div>
          </div>
        </div>
      </form>
    );
  }
}
