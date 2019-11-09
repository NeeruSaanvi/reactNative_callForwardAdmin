import React from 'react'
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Redirect, Route} from "react-router-dom";
import withSuspense from '../components/HOC/withSuspense';
import { logout as logOutActionCreator } from "../redux/AuthRedux";
import {toast} from 'react-toastify'
import {Type, Position} from "../constants/Notifications";


class AuthRoute extends React.Component {
  static propTypes = {
    component: PropTypes.elementType.isRequired,
    exact: PropTypes.bool,
    path: PropTypes.string.isRequired,
    key: PropTypes.string,
    dataKey: PropTypes.string,
    name: PropTypes.string.isRequired
  };

  static defaultProps = {
    exact: false
  };

  render() {
    const WrappedComponent = this.props.component;
    const checkPaths = ['/login', '/register'];
    const renderRedirect = this.props.authenticated ? checkPaths.includes(this.props.path) : !checkPaths.includes(this.props.path);
    let redirectUrl = this.props.authenticated ? '/dashboard' : '/login';
    if(this.props.profile && !this.props.profile.isChangePassword) redirectUrl = "/reset-password";

    // If not super admin redirect to login page
    if(this.props.profile && !this.props.profile.isSuperAdmin) {
      this.props.logout();
      toast("You have no rights to view this page.", 
          {type: Type.ERROR, position: Position.TOP_RIGHT, autoClose: true});
    }
    
    return (
        <Route exact={this.props.exact}
               path={this.props.path}
               key = {this.props.dataKey}
               name = {this.props.name}
               render={ () => (renderRedirect ? <Redirect to={redirectUrl}/> : <WrappedComponent />)
               }
        />
    )
  }
}

export default withSuspense(connect(
  (state) => ({ 
    authenticated: state.auth.isAuthenticated || false, 
    profile: state.auth.profile
  }),
  (dispatch) => ({
    logout: () => dispatch(logOutActionCreator())
  })
)(AuthRoute))