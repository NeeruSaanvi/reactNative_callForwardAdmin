import React from 'react'
import {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";
import {Col, Row} from "reactstrap";
import MainInfo from "./MainInfo";
import ChangePassword from "./ChangePassword";
import Additional from "./Additional";
import EditIP from "./EditIP";
import API from '../../service/RestApi'
import produce from 'immer'
import {profileUpdated} from "../../redux/AuthRedux";
import {connect} from "react-redux";
import RestApi from "../../service/RestApi";


const defaultPassword = {old: '', new: '', confirm: '', oldError: '', newError: '', confirmError: ''};

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      main: {},
      additional: {},
      ips: [],
      password: {},
      company: []
    };
    this.originalState = {...this.state};
  }

  componentDidMount() {
    const callApi = this.props.callApi;
    callApi(API.getProfile, this.showProfileData);
    if(this.props.profile.isSuperAdmin) {
      this.props.callApi(RestApi.listAllCompany, response => {
        if (response.ok) {
          this.setState({"company": response.data})
        }
      });
    } else {
      this.setState({"company": this.props.profile.company});
    }
  }

  render() {
    return (
      <Row>
        <Col lg="6">
          <MainInfo data={this.state.main} company={this.state.company} handleCompanyChange={this.handleCompanyChange} isCollapsible hasFooter handleChange={this.handleChange('main')} resetHandler={this.resetMainForm} updateHandler={this.updateMainForm}/>
          <EditIP isSuperAdmin={this.props.profile.isSuperAdmin} data={this.state.ips} isCollapsible hasFooter addIp={this.addIp} removeIp={this.removeIp} resetHandler={this.resetIPForm} updateHandler={this.updateIPForm}/>
        </Col>
        <Col lg="6">
          <ChangePassword data={this.state.password} isCollapsible hasFooter handleChange={this.handleChange('password')} resetHandler={this.resetPassword}
                          updateHandler={this.updatePassword} showOldPassword/>
          <Additional data={this.state.additional} isCollapsible hasFooter handleChange={this.handleChange('additional')} resetHandler={this.resetAddForm}
                      updateHandler={this.updateAddForm}/>
        </Col>
      </Row>)
  }

  showProfileData = (response) => {
    if (!response.ok) {
      return;
    }
    const {main, additional, ips} = response.data;
    this.setState({main: main, additional: additional, ips: ips.slice(0)});
    this.originalState = produce(this.state, old => {
    });
    this.props.updateProfile(this.state.main.firstName, this.state.main.lastName)
  };

  handleChange = (key) => {
    return (obj) => {
      this.setState({[key]: {...this.state[key], ...obj}});
    };
  };

  handleCompanyChange = async(evt) => {
    let compId = evt.target.value;
    await this.setState({"main": {...this.state.main, compId}});
  };

  addIp = (ip) => {
    const ips = produce(this.state.ips, ips => {
      ips.push(ip);
    });
    this.setState({ips: ips});
  };

  removeIp = (ip) => {
    const ips = produce(this.state.ips, ips => {
      const index = ips.indexOf(ip);
      if (index !== -1) {
        ips.splice(index, 1);
      }
    });
    this.setState({ips: ips});
  };

  updateMainForm = (data) => {
    if(!data.compId  || data.compId == "null") 
      data.compId = this.state.company[0].id;

    if(this.props.profile.isSuperAdmin)  data.compId = 0;
    
    const callApi = this.props.callApi;
    callApi(API.updateProfileMain, (response) => {
      this.originalState.main = {...this.state.main};
      if (response.ok) {
        this.props.updateProfile(this.state.main.firstName,
          this.state.main.lastName);
      }
    }, data);
  };

  updatePassword = (data) => {
    // Validation Password
    if (data.old === undefined || data.old === "") {
      const oldError = produce(this.state.password, m => {
        m.oldError = "Please input Old Password!";
      });
      this.setState({password: oldError});
      return false;
    }
    if (data.new === undefined || data.new === "") {
      const newError = produce(this.state.password, m => {
        m.newError = "Please input New Password!";
      });
      this.setState({password: newError});
      return false;
    }
    if (data.confirm === undefined || data.confirm === "") {
      const confirmError = produce(this.state.password, m => {
        m.confirmError = "Please confirm new Password!";
      });
      this.setState({password: confirmError});
      return false;
    }
    if (data.new !== data.confirm) {
      const confirmError = produce(this.state.password, m => {
        m.confirmError = "Password does not match";
      });
      this.setState({password: confirmError});
      return false;
    }
    let req = {oldPassword: data.old, newPassword: data.new};
    const callApi = this.props.callApi;
    callApi(API.updatePassword, (response) => {
      if (response.ok) {
        this.setState({password: defaultPassword})
      }
    }, req);
  };

  updateAddForm = (data) => {
    const callApi = this.props.callApi;
    callApi(API.updateProfileAdditional, (response) => {
      if (response.ok){
        this.originalState.additional = {...this.state.additional}
      }
    }, data)
  };

  updateIPForm = (data) => {
    const callApi = this.props.callApi;
    callApi(API.updateProfileIps, (response) => {
      if (response.ok){
        this.originalState.ips = this.state.ips.slice(0);
      }
    }, data);
  };

  resetMainForm = () => {
    this.setState({main: {...this.originalState.main}})
  };

  resetPassword = () => {
    this.setState({password: defaultPassword})
  };

  resetAddForm = () => {
    this.setState({additional: {...this.originalState.additional}})
  };

  resetIPForm = () => {
    this.setState({ips: this.originalState.ips.slice(0)});
  }
}

export default connect(state => ({
  profile: state.auth.profile
}), dispatch => ({
  updateProfile:(firstName, lastName) => dispatch(profileUpdated({firstName, lastName}))
})
)(withAuthApiLoadingNotification(Account));


