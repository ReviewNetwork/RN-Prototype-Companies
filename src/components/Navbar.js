import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class Navbar extends React.Component {
  state = {
    mobileMenuOpen: false,
  };

  constructor(props) {
    super(props);
    this.store = this.props.store.user;
  }

  toggleMobileMenu() {
    this.setState({
      mobileMenuOpen: !this.state.mobileMenuOpen
    })
  }

  render() {
    const { authenticated } = this.store;
    return (
      <nav className="navbar">
        <div className="navbar-inner navbar-inner--mobile">
          <div className="navbar-mobile">
            <Link to="/" className="logo">
              <img
                style={{ height: '24px' }}
                src="/nav-logo.png"
                alt="ReviewNetwork"
              />
            </Link>

            <button onClick={() => this.toggleMobileMenu()} className="button-action"><i className="material-icons">menu</i> Menu</button>
          </div>

          <div className={`navbar-mobile-menu ${this.state.mobileMenuOpen ? 'navbar-mobile-menu--open': ''}`}>
            {authenticated && (
              <React.Fragment>
                <NavLink exact activeClassName="active-link" to="/">
                  Market Research
                </NavLink>
                <NavLink exact activeClassName="active-link" to="/wallet">
                  Wallet
                </NavLink>
              </React.Fragment>
            )}

            {!authenticated ? (
              <React.Fragment>
                <NavLink exact activeClassName="active-link" to="/login">
                  Login
                </NavLink>
                <NavLink exact activeClassName="active-link" to="/register">
                  Register
                </NavLink>
              </React.Fragment>
            ) : (
              <NavLink
                className="link--secondary"
                exact
                activeClassName="active-link"
                to="/settings"
              >
                <i className="material-icons">settings</i>
                Account Settings
              </NavLink>
            )}
          </div>

        </div>
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link to="/" className="logo">
              <img
                style={{ height: '24px' }}
                src="/nav-logo.png"
                alt="ReviewNetwork"
              />
            </Link>

            {authenticated && (
              <React.Fragment>
                <NavLink exact activeClassName="active-link" to="/">
                  Market Research
                </NavLink>
                <NavLink exact activeClassName="active-link" to="/wallet">
                  Wallet
                </NavLink>
              </React.Fragment>
            )}
          </div>
          <div className="navbar-right">
            {!authenticated ? (
              <React.Fragment>
                <NavLink exact activeClassName="active-link" to="/login">
                  Login
                </NavLink>
                <NavLink exact activeClassName="active-link" to="/register">
                  Register
                </NavLink>
              </React.Fragment>
            ) : (
              <NavLink
                className="link--secondary"
                exact
                activeClassName="active-link"
                to="/settings"
              >
                <i className="material-icons">settings</i>
                Account Settings
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    );
  }
}

export default withRouter(Navbar);
