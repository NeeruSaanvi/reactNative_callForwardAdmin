import React, { Component } from 'react'
import withLoadingAndNotification from "../../components/HOC/withLoadingAndNotification";
import { connect } from "react-redux";
import { Modal, ModalHeader, ModalBody, ModalFooter, Card, CardBody } from 'reactstrap';
import { Row, Col, Button, Form } from 'react-bootstrap';
import CardHeader from 'reactstrap/es/CardHeader';
import companyEntity from './companyEntity';
import PropTypes from "prop-types";
import RestApi from "../../service/RestApi";

class CompanyModal extends Component {
  static propTypes = {
    company: PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      roleCode: PropTypes.string.isRequired,
      respOrgId: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      zip: PropTypes.string.isRequired,
      user: PropTypes.shape({
        username: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        roId: PropTypes.string.isRequired,
        profile: PropTypes.shape({
          mobile: PropTypes.string.isRequired,
        })
      })
    }),
    modal: PropTypes.shape({
      show: PropTypes.bool.isRequired
    }),
    type: PropTypes.string.isRequired,
    onHide: PropTypes.func,
    ...Modal.propTypes,
  };

  constructor(props) {
    super(props);
    this.state = {
      modal: {},
      isValidated: false,
      company: companyEntity,
      tooltipOpen: true
    }
  }

  static getDerivedStateFromProps(props, state) {
    state.type = props.type;
    return state;
  }

  componentDidMount() {
    this.setState({ company: this.props.company, modal: this.props.modal });
  }

  componentDidUpdate(prevProps, preState) {
    if (this.props.type === "Edit") {
      if (prevProps.company !== this.props.company) {
        this.setState({ company: this.props.company });
      }
    }

    if (preState.modal !== this.props.modal) {
      this.setState({ modal: this.props.modal }, () => { });
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      isValidated: false,
      company: companyEntity,
      modal: !prevState.modal
    }));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ isValidated: true })
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return false;
    }
    let username = this.state.company.user.roId;
    this.state.company.user.username = username;

    // Add company
    if (this.state.type == "Add")
      this.props.callApi(RestApi.addCompany, response => {
        if (response.ok) {
          this.state.modal.show = false;
          this.reset();
          this.props.onHide();
        } 
      }, this.state.company);

    // Update Company
    if (this.state.type == "Edit")
      this.props.callApi(RestApi.updateCompany, response => {
        if (response.ok) {
          this.state.modal.show = false;
          this.reset();
          this.props.onHide();
        } 
      }, this.state.company);
  }

  handleChange = (e) => {
    this.setState({ company: { ...this.state.company, [e.target.name]: e.target.value } })
  }

  handleUserChange = (e) => {
    this.setState({
      company: {
        ...this.state.company,
        user: { ...this.state.company.user, [e.target.name]: e.target.value }
      }
    })
  }

  handleProfileChange = (e) => {
    this.setState({
      company: {
        ...this.state.company,
        user: { ...this.state.company.user, 
        profile: {...this.state.company.user.profile , [e.target.name]: e.target.value }}
      }
    })
  }

  reset = () => {
    this.setState(prevState => ({
      isValidated: false,
      company: companyEntity,
      modal: {show: false}
    }));
  }

  render() {
    return (
      <div>
        <Modal size="xl" isOpen={this.state.modal.show}>
          <ModalHeader toggle={this.toggle}>Company</ModalHeader>
          <ModalBody>
            <Form noValidate validated={this.state.isValidated} onSubmit={this.handleSubmit}>
              <Row>
                <Col md={6}>
                  <Card>
                    <CardHeader>Company Information</CardHeader>
                    <CardBody>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="name">Company name</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="Company Name"
                            defaultValue={this.state.company.name} name="name" id="name" />
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="code">Company Code</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="Company Code" 
                            defaultValue={this.state.company.code} name="code" id="code" />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="code">Role Code</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="Role Code" maxLength="3"
                            defaultValue={this.state.company.roleCode} name="roleCode" id="roleCode" />
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="respOrgId">Resp Org ID</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="Resp Org ID"
                            defaultValue={this.state.company.respOrgId} name="respOrgId" id="respOrgId" />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="email">Company Email</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="email" placeholder="Company Email"
                            defaultValue={this.state.company.email} name="email" id="email" />
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="address">Address</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="Address"
                            defaultValue={this.state.company.address} name="address" id="address" />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="city">City</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="City"
                            defaultValue={this.state.company.city} name="city" id="city" />
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="state">State</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="text" placeholder="State"
                            defaultValue={this.state.company.state} name="state" id="state" />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="zip">Zip Code</Form.Label>
                          <Form.Control onChange={this.handleChange}
                            required type="number" placeholder="Zip Code"
                            defaultValue={this.state.company.zip} name="zip" id="zip" />
                        </Form.Group>
                      </Form.Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <CardHeader>Primary Contact</CardHeader>
                    <CardBody>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="firstName">First name</Form.Label>
                          <Form.Control onChange={this.handleUserChange}
                            required type="text" placeholder="First Name" minLength="3"
                            defaultValue={this.state.company.user.firstName} name="firstName" id="firstName" />
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="lastName">Last Name</Form.Label>
                          <Form.Control onChange={this.handleUserChange}
                            required type="text" placeholder="Last Name"
                            defaultValue={this.state.company.user.lastName} name="lastName" id="lastName" />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="uEmail">Email</Form.Label>
                          <Form.Control onChange={this.handleUserChange}
                            required type="email" placeholder="Contact Email"
                            defaultValue={this.state.company.user.email} name="email" id="uEmail" />
                        </Form.Group>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="mobile">Contact Phone</Form.Label>
                          <Form.Control onChange={this.handleProfileChange}
                            required type="text" placeholder="Contact Phone"
                            defaultValue={this.state.company.user.profile.mobile} name="mobile" id="mobile" />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                        <Form.Group as={Col} md="6">
                          <Form.Label htmlFor="roId">RO ID</Form.Label>
                          <Form.Control onChange={this.handleUserChange}
                            required type="text" placeholder="RO ID" minLength="3"
                            defaultValue={this.state.company.user.roId} name="roId" id="roId" />
                        </Form.Group>
                      </Form.Row>
                    </CardBody>
                  </Card>
                  <Row>
                    <Col className="text-right" md={12}>
                      <Button disabled={ this.state.type == "Edit" } onClick={() => this.setState({company: companyEntity})} type="reset" size="md" variant="danger" className="mr-2">
                        <i className="fa fa-refresh" /> Reset
                      </Button>
                      {this.state.type === "Add" && <Button type="submit" size="md" color="primary">
                        <i className="fa fa-dot-circle-o" /> Add
                      </Button>}

                      {this.state.type === "Edit" && <Button type="submit" size="md" color="primary">
                        <i className="fa fa-dot-circle-o" /> Update
                      </Button>}

                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </Modal>
      </div>
    )
  }


}

export default connect(state => ({ roles: state.auth.profile.roles }))(withLoadingAndNotification(CompanyModal))

