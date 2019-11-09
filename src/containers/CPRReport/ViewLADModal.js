import React, {Component} from 'react'
import _ from 'lodash';
import {Button, Card, CardBody, Col, Input, Label, Modal, ModalHeader, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";
import PropTypes from "prop-types";
import ModalBody from "reactstrap/es/ModalBody";
import '../../scss/react-table.css'
import classnames from "classnames";
import RestApi from "../../service/RestApi";
import {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";

class ViewCPRModal extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    handler: PropTypes.func,
    id: PropTypes.number,
    data: PropTypes.array,
    ...Modal.propTypes,
  };

  static defaultProps = {
    isEditable: true
  };

  constructor(props) {
    super(props);
    this.state ={
      activeTab: '1',
      sd: [],
    }
  }

  toggle = (tab) => {
    this.state.activeTab !== tab && this.setState({activeTab: tab});
    if (tab === "2") {
      this.props.callApi(RestApi.get6Digit, res => {
        if (res.ok) {
          this.setState({sd: res.data});
        }
      }, this.props.id)
    }
  };

  render() {
    let {data} = this.props;
    let column = [];
    let valid = [];
    let colSD = [];
    let sd = [];
    if (data && data.length) {
      data.map(d => {
        let defs = d.definitions.split(",");
        return column = column.concat(_.chunk(defs, 7).map((arr, index) => {
          arr = arr.concat(Array(7 - arr.length).fill(""));
          arr.unshift(index === 0 ? d.label: '');
          valid.push(arr);
          return arr;
        }))});
    }
    if (this.state.sd && this.state.sd.length) {
      this.state.sd.map(d => {
        let defs = d.definitions.split(",");
        return colSD = colSD.concat(_.chunk(defs, 7).map((arr, index) => {
          arr = arr.concat(Array(7 - arr.length).fill(""));
          arr.unshift(index === 0 ? d.label: '');
          sd.push(arr);
          return arr;
        }))})
    }
    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader toggle={this.props.toggle}>View LAD</ModalHeader>
        <ModalBody>

            <Nav tabs className="custom">
              {this.renderNavbar("1", "LATA")}
              {this.renderNavbar("2", "6-Digit")}
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row className="col-12">
                  <table className="table-bordered fixed_header" >
                    <thead>
                    <tr>
                      <th className="text-center">Label</th>
                      <th className="text-center">Definition</th>
                      <th className="text-center">Definition</th>
                      <th className="text-center">Definition</th>
                      <th className="text-center">Definition</th>
                      <th className="text-center">Definition</th>
                      <th className="text-center">Definition</th>
                      <th className="text-center">Definition</th>
                    </tr>
                    </thead>
                    <tbody>
                    {valid && valid.map((value, i) => {return (<tr>
                      {value.map((element, j) => {
                        return (<td className="text-center">{element}</td>)})}
                    </tr>)})
                    }
                    </tbody>
                  </table>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <table className="table-bordered fixed_header">
                  <thead>
                  <tr>
                    <th className="text-center">Label</th>
                    <th className="text-center">Definition</th>
                    <th className="text-center">Definition</th>
                    <th className="text-center">Definition</th>
                    <th className="text-center">Definition</th>
                    <th className="text-center">Definition</th>
                    <th className="text-center">Definition</th>
                    <th className="text-center">Definition</th>
                  </tr>
                  </thead>
                  <tbody>
                  {sd && sd.map((value, i) => {return (<tr>
                    {value.map((element, j) => {
                      return (<td className="text-center">{element}</td>)})}
                  </tr>)})
                  }
                  </tbody>
                </table>
              </TabPane>
            </TabContent>
        </ModalBody>
      </Modal>
    );
  }

  handleChange = (type, value) => {
    this.props.handler(type, value);
  };

  renderNavbar = (id, name) => {
    return  <NavItem>
      <NavLink className={classnames({active: this.state.activeTab === id})} onClick={() => {this.toggle(id);}}>
        <Label>{name}</Label>
      </NavLink>
    </NavItem>
  };
}

export default withAuthApiLoadingNotification(ViewCPRModal)
