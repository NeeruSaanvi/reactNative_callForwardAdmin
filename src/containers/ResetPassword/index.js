import React, { Component } from 'react'
import withLoadingAndNotification from "../../components/HOC/withLoadingAndNotification";
import RestApi from "../../service/RestApi";
import { connect } from "react-redux";
import Loader from "../../components/Loader";
import { Button, Card, CardBody, CardGroup, Col, Container,
  FormFeedback, Input, Label, Row, Alert
} from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { resetPassword, logout as logOutActionCreator } from "../../redux/AuthRedux";


class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      verifyPassword: "",
      isPassword: false,
      isVerifyPassword: "",
      isConfirmPassword: "",
      isSuccess: false
    };
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value });
  }

  handleSubmit = async(e) => {
    this.setState({ isVerifyPassword: false, isPassword: false, isConfirmPassword: false  });
    if (this.state.password === "") {
      await this.setState({isPassword: true});
      return false;
    }
    if (this.state.verifyPassword === "") {
      this.setState({ isVerifyPassword: true });
      return false;
    }

    if (this.state.password !== this.state.verifyPassword) {
      this.setState({ isConfirmPassword: true });
      return false;
    }
    
    let user = { newPassword: this.state.password, oldPassword: "" }

    this.props.callApi(RestApi.updateUserPassword, response => {
      if (response.ok) {
        this.setState({isSuccess: true})
        this.props.resetPassword();
        this.props.logout();
        window.location.reload();
      } 
    }, this.props.auth.profile.id, user);
  }

  render() {
    let validServer = process.env.REACT_APP_API_ENDPOINT === "http://208.76.97.21:8082/api/v1/";
    return (
      <div className="app align-items-center" style={{ height: 10 }}>
        { Object.keys(this.props.auth).length === 0 &&  <Redirect to="/login"/> }
        { this.state.isSuccess &&  <Redirect to="/dashboard"/> }
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md="5">
              {validServer ? <img src="assets/img/login.png" alt="dipvtel" width={'80%'} className="ml-5" /> : <img src='assets/img/logo_22.png' alt="dipvtel" width={'78%'} className="ml-5" />}
              <CardGroup className="mt-1">
                <Card className="p-4">
                  <CardBody>
                    { this.state.isConfirmPassword && <Alert color="danger">Password not match</Alert> }
                    <Label htmlFor="password">Password</Label>
                    <Input invalid={this.state.isPassword} type="password" value={this.state.password} onChange={this.handleChange} name="password" id="password" />
                    {this.state.isPassword && <FormFeedback>Please input your password</FormFeedback> }
                    <Label className="mt-4">Verify Password</Label>
                    <Input invalid={this.state.isVerifyPassword } type="password" value={this.state.verifyPassword} onChange={this.handleChange} name="verifyPassword" id="verifyPassword" />
                    {this.state.isVerifyPassword && <FormFeedback>Please input your password</FormFeedback>}
                    {this.state.isConfirmPassword && <FormFeedback>Password not match</FormFeedback>}
                    <Row className="mt-4">
                      <Col xs="12" className="text-right">
                        <Button size="md" color="primary" onClick={this.handleSubmit}>
                          <strong className="text-white">Update</strong>
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>

      </div>
    );
  }
}

export default connect(
  (state) => ({
    auth: state.auth
  }),
  (dispatch) => ({
    resetPassword: () => dispatch(resetPassword()),
    logout: () => dispatch(logOutActionCreator())
  }))(withLoadingAndNotification(ResetPassword))
  