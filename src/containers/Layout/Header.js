import React, {Component} from 'react';
import {Badge, DropdownItem, DropdownMenu, DropdownToggle, Input, Nav, NavItem, NavLink} from 'reactstrap';
import PropTypes from 'prop-types';
import {AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import logo_21 from '../../assets/img/brand/logo_21_new.png'
import logo_22 from '../../assets/img/brand/logo_22.png'
import portal from '../../assets/img/brand/portal.png'
import {connect} from "react-redux";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import ReactToolTip from 'react-tooltip';
import 'react-circular-progressbar/dist/styles.css';
import { logout as logOutActionCreator } from '../../redux/AuthRedux';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: []
    };
  }

  componentDidMount() {
    this.backPressureEvent();
  }

  backPressureEvent = () => {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    if (!this.props.token) {
      return;
    }
    const eventSource = new EventSource(process.env.REACT_APP_API_ENDPOINT + 'backpressure_events/?access_token=' + this.props.token, {withCredentials: false});
    eventSource.onmessage = (event) => {
      console.log("Event Source data", JSON.parse(event.data));
      try {
        const data = JSON.parse(event.data);
        this.setState({progress: data})
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
    let validServer = process.env.REACT_APP_API_ENDPOINT === "http://208.76.97.21:8082/api/v1/";

    const { children, profile, ...attributes } = this.props;
    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        {validServer ?
          <AppNavbarBrand full={{ src: portal, width: 200, height: 55, alt: 'user', position: 'responsive' }}/>
        :
          <AppNavbarBrand full={{ src: logo_22, width: 250, height: 70, alt: 'user', position: 'responsive' }}/>
        }
        <Nav className="ml-auto" navbar>
          {/*<NavItem className="d-md-down-none">*/}
            {/*<NavLink href="#"><i className="icon-bell"/><Badge pill color="danger">5</Badge></NavLink>*/}
          {/*</NavItem>&nbsp;&nbsp;*/}
          {this.state.progress.map(prog => {
            let {description, progress, category } = prog;
            let isImport = category === "cprgen.lergImport" || category === "cprgen.cdrImport"
            || category === "cprgen.rateDeckImport";
            progress = Math.round(progress * 100);
            if (!isImport) {
              return <div className="mr-3">
                <a data-tip data-for="cprGenProgress"><img src="../../assets/img/spinner.gif" style={{width: 70}}/></a>
                <ReactToolTip id='cprGenProgress' type='dark' effect="solid"><span>{description}</span></ReactToolTip>
              </div>
            } else {
              return <div style={{width: 42}} className="mr-3">
                <a data-tip data-for="cprGenProgress">
                  <CircularProgressbarWithChildren value={progress} strokeWidth={11}>
                    <div style={{ fontSize: 12}}><strong>{progress}%</strong></div>
                  </CircularProgressbarWithChildren>
                </a>
                <ReactToolTip id='cprGenProgress' type='dark' effect="solid"><span>{description}</span></ReactToolTip>
              </div>
            }
          })}

          <span>
            {
              (() => {
                if (profile) {
                  if (profile.firstName || profile.lastName) {
                    return profile.firstName + " " + profile.lastName
                  } else {
                    return profile.username
                  }
                }
              })()
            }
          </span>
          <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
              <img src='../assets/img/avatars/avatar.png' className="img-avatar" style={{width: 44, height: 44}}/>
            </DropdownToggle>
            <DropdownMenu right style={{ right: 'auto' }}>
              {/*<DropdownItem><i className="fa fa-user"/> Profile</DropdownItem>*/}
              <DropdownItem onClick={this.props.logout}><i className="fa fa-lock"/> Logout</DropdownItem>
            </DropdownMenu>
          </AppHeaderDropdown>
        </Nav>
      </React.Fragment>
    );
  }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;


export default connect(
  state => ({
    profile: state.auth.profile,
    token: state.auth.token
  }),
  dispatch => ({ logout: () => dispatch(logOutActionCreator()),
  }))(Header)
