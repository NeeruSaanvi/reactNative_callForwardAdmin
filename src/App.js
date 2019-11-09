import React, {Component} from 'react';
import {Switch} from 'react-router-dom';
import './App.scss';
// Containers
import AuthRoute from './components/AuthRoute';
import {history} from './redux/CreateStore';
import {ConnectedRouter} from 'connected-react-router';
import {ToastContainer, toast} from "react-toastify";
import {connect} from "react-redux";
import {NativeEventSource, EventSourcePolyfill} from 'event-source-polyfill';
import 'react-toastify/dist/ReactToastify.min.css'
import {showNotification} from "./redux/NotificationRedux";
import {Type, Position} from "./constants/Notifications";

const Layout = React.lazy(() => import('./containers/Layout/Layout'));
const Login = React.lazy(() => import('./containers/Login/Login'));
const ResetPassword = React.lazy( () => import('./containers/ResetPassword'));


const EventSource = NativeEventSource || EventSourcePolyfill;
// OR: may also need to set as global property
global.EventSource =  NativeEventSource || EventSourcePolyfill;

class App extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.notification.created !== prevProps.notification.created) {
      const message = this.props.notification.message;
      toast(message, {type: this.props.notification.type, position: this.props.notification.position, autoClose: 0});
    }

    if (this.props.token !== prevProps.token) {
      // delete previous subscription
      // subscribe to notification api.
      this.subscribeNotification();
    }
  }

  componentDidMount() {
    this.subscribeNotification();
  }

  subscribeNotification = () => {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    if (!this.props.token) {
      return;
    }
    const eventSource = new EventSource(process.env.REACT_APP_API_ENDPOINT + 'notification/subscribe?access_token=' + this.props.token, {withCredentials: false});
    //eventSource.onopen = (event) => console.log('open', event); // <2>
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message){
          toast(data.message, {type: data.type || Type.INFO, position: Position.TOP_RIGHT, autoClose: false});
        }
      } catch(ex){
        console.log(ex);
      }
      // this.props.toast(NotificationType(data.type), data.message, false);
    };
    /*
    eventSource.onerror = (event) => {
      console.log('error', event);
      // this.subscribeNotification();
    };*/
    this.eventSource = eventSource
  };



  render() {
    return (
      <>
        <ConnectedRouter history={history}>
          <Switch>
            <AuthRoute exact path="/login" name="Login Page" component={Login} key="login" dataKey="login"/>
            <AuthRoute exact path="/reset-password" name="Reset Password" component={ResetPassword} key="resetPassword" dataKey="resetPassword"/>
            <AuthRoute path="/" name="Home" component={Layout} key="home" dataKey="home"/>
          </Switch>
        </ConnectedRouter>
        <ToastContainer autoClose={2000} hideProgressBar/>
      </>
    );
  }
}

export default connect(
  (state) => ({notification: state.notification, token: state.auth.token}),
  (dispatch) => ({toast:(type, message) => dispatch(showNotification(type, message)),})
)(App);
