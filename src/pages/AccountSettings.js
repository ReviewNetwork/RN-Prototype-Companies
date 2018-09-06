import React from 'react';
import { inject, observer } from 'mobx-react';
import Config from '../config';
import Protected from '../components/Protected';

@Protected
@inject('store')
@observer
class AccountSettings extends React.Component {
  state = {
    appVersion: '',
    support: {
      EMAIL: '',
      SUBJECT: '',
      BODY: '',
    },
    name: localStorage.getItem(`${localStorage.getItem('email')}_name`),
  };

  componentDidMount() {
    Config.config.then(config => {
      this.setState({
        appVersion: config.appVersion,
        support: config.COMPANY_MVP_SUPPORT,
      });
    });
  }

  handleLogOut = async () => {
    await this.props.store.user.logout();
    localStorage.removeItem('email');
    this.props.history.push('/');
  };

  render() {
    const { EMAIL, SUBJECT, BODY } = this.state.support;
    return (
      <div className="account-settings">
        <div className="card card-dark">
          <h3 className="card-title">{this.state.name}</h3>
          <p className="rew-version">
            Review.Network Research - {this.state.appVersion}
          </p>
        </div>

        <div className="request-buttons">
          <div className="card group-half-wrap">
            <div className="group-half card-btn-wrap">
              <a
                className="report-issue-link-btn"
                href={`mailto:${EMAIL}?subject=${SUBJECT}&body=${BODY}`}
              >
                <button className="card card-btn card-btn-linear">
                  Report Issue
                </button>
              </a>
            </div>

            <div className="group-half card-btn-wrap">
              <button
                onClick={this.handleLogOut}
                className="card card-btn card-btn-grey"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountSettings;
