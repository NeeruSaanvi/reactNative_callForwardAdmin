import React, {Component} from 'react'
import _ from 'lodash';
import {Button, Card, CardBody, Col, Input, Label, Modal, ModalHeader, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";
import PropTypes from "prop-types";
import ModalBody from "reactstrap/es/ModalBody";
import '../../scss/react-table.css'
import {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";
import FormGroup from "reactstrap/es/FormGroup";
import RestApi from "../../service/RestApi";

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
      states: this.props.data.states,
      carriers: this.props.data.carriers || [],
      latas: this.props.data.latas || [],
      npanxxs: this.props.data.npanxxs || [],
    };
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (nextProps.data.states && nextProps.data.states !== this.state.states) {
      this.setState({states: nextProps.data.states})
    }
    if (nextProps.data.carriers && nextProps.data.carriers !== this.state.carriers) {
      this.setState({carriers: nextProps.data.carriers})
    }
    if (nextProps.data.latas && nextProps.data.latas !== this.state.latas) {
      this.setState({latas: nextProps.data.latas})
    }
    if (nextProps.data.npanxxs && nextProps.data.npanxxs !== this.state.npanxxs) {
      this.setState({npanxxs: nextProps.data.npanxxs})
    }
    if (nextProps.data.npalist && nextProps.data.npalist !== this.state.npalist) {
      this.setState({npalist: nextProps.data.npalist})
    }
  }

  download = () => {
    // let npanxxs = this.state.npanxxs;
    // npanxxs.shift();
    // npanxxs = npanxxs.join(",");
    // let urlContent = "data:application/octet-stream," + encodeURIComponent(npanxxs);
    // window.open(urlContent);
    this.props.callApi(RestApi.downloadNewCPRReportData1, {})
  };

  render() {
    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader toggle={this.props.toggle}>View Data</ModalHeader>
        <ModalBody>
          <FormGroup row>
            <Col lg={4} className="row">
              <Label className="col-5 text-right">State:</Label>
              <Input type="select" className="col-7 form-control-sm" name="state" onChange={(ev) => this.handleChange(ev.target.name, ev.target.value)} value={this.props.data.state}>
                {this.state.states && this.state.states.map(s => <option value={s.split("(")[0]}>{s}</option>)}
              </Input>
            </Col>
            <Col lg={4} className="row">
              <Label className="col-5 text-right">LATA:</Label>
              <Input type="select" className="col-7 form-control-sm" name="lata" onChange={(ev) => this.handleChange(ev.target.name, ev.target.value)} value={this.props.data.lata}>
                {this.state.latas && this.state.latas.map(s => <option value={s.split("(")[0]}>{s}</option>)}
              </Input>
            </Col>
            <Col lg={4} className="row">
              <Label className="col-5 text-right">NPANXX:</Label>
              <Input type="select" className="col-7 form-control-sm" name="npanxx" onChange={(ev) => this.handleChange(ev.target.name, ev.target.value)} value={this.props.data.npanxx}>
                {this.state.npanxxs && this.state.npanxxs.map(s => <option value={s}>{s}</option>)}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col lg={2}><Label className="text-right">Carriers:</Label></Col>
            {this.state.carriers.map(s => <Col lg={2}>
              <Button size="sm" color="secondary" onClick={() => this.handleChange("carrier", s.split("(")[0])}>{s}</Button>
            </Col>)}
          </FormGroup>
          <FormGroup className="float-right">
            <Button size="sm" color="success" className="ml-2" onClick={() => {
              this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/new_cpr_report/view1/" + this.props.id+ '/download?state='+this.props.data.state +
                '&lata='+this.props.data.lata +'&carrier='+this.props.data.carrier;
              this.textInput.value = this.props.auth.token;
              this.downloadForm.submit();
              this.textInput.value = "";
            }}>Download</Button>          </FormGroup>
          <FormGroup row>
            <table className="table-bordered fixed_header" >
              <tbody>
              {this.state.npalist && this.state.npalist.map((value, i) => {return (<tr>
                {value.map((element, j) => {
                  return (<td className="text-center">{element}</td>)})}
              </tr>)})
              }
              </tbody>
            </table>
          </FormGroup>
        </ModalBody>
        <form ref={(node)=> {this.downloadForm = node}} action="" target="_blank" method="post">
          <input type="hidden" ref={(input)=> {this.textInput = input}} name="access_token" value=""/>
        </form>
      </Modal>
    );
  }

  handleChange = (type, value) => {
    console.log(type, value);
    this.props.handler(type, value);
    if (type === "state") {
      this.props.callApi(RestApi.searchNewCPRReportData1, res => {
        if (res.ok) {
          let {carriers, latas, npanxxs} = res.data;
          latas.unshift("");
          let npa = npanxxs.slice(0);
          npanxxs.unshift("");
          let npalist = [];
          while (npa.length) npalist.push(npa.splice(0, 10));
          this.props.handler("npalist", npalist);
          this.props.handler("npanxxs", npanxxs);
          this.props.handler("carriers", carriers);
          this.props.handler("latas", latas);
          this.props.handler("carrier", "");
          this.props.handler("lata", "");
          this.props.handler("npanxx", "")
        }
      }, this.props.id, {
        state: value
      });
    } else {
      this.props.callApi(RestApi.searchNewCPRReportData1, res => {
        if (res.ok) {
          let {carriers, latas, npanxxs} = res.data;
          latas.unshift("");
          let npa = npanxxs.slice(0);
          npanxxs.unshift("");
          let npalist = [];
          console.log(npa);
          console.log(npa);
          while (npa.length) npalist.push(npa.splice(0, 10));
          this.props.handler("npalist", npalist);
          this.props.handler("npanxxs", npanxxs);
          this.props.handler("carriers", carriers);
          this.props.handler("latas", latas);
          if (res.data.carriers.length === 0) {
            this.props.handler("carrier", "");
          }
          if (res.data.latas.length === 0) {
            this.props.handler("lata", "");
          }
          if (this.props.data.lata === "") {
            this.props.handler("npanxx", "");
          }
        }
      }, this.props.id, {
        state: type === "state" ? value : this.props.data.state.split("(")[0],
        carrier: type === "carrier" ? value : "",
        lata: type === "lata" ? value : this.props.data.lata.split("(")[0],
        npanxx: type === "npanxx" ? value : "",
      });
    }

  }
}

export default withAuthApiLoadingNotification(ViewCPRModal)
