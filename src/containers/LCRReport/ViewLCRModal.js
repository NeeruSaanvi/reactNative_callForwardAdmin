import React, {Component} from 'react'
import {Col, Modal, ModalHeader, Row, Input, Nav, NavItem, NavLink, Label, Button, TabPane} from "reactstrap";
import PropTypes from "prop-types";
import ModalBody from "reactstrap/es/ModalBody";
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import {formatAverageCost, formatCost, formatDuration} from "../../components/utiles";
import numeral from "numeral";
import classnames from "classnames";

class ViewLCRModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    data2: PropTypes.object,
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    columns: PropTypes.arrayOf(PropTypes.object),
    columns2: PropTypes.arrayOf(PropTypes.object),
    fetchData: PropTypes.func,
    fetchData2: PropTypes.func,
    total_page: PropTypes.number,
    total_page2: PropTypes.number,
    handler: PropTypes.func,
    isLcr: PropTypes.bool,
    default_carrier: PropTypes.string,
    description: PropTypes.string,
    isLata1: PropTypes.bool,
    average_rate: PropTypes.number,
    title: PropTypes.string,
    ...Modal.propTypes,
  };

  static defaultProps = {
    isEditable: true
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1'
    }
  }

  render() {
    let {total_duration, title} = this.props;

    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader toggle={this.props.toggle} className="col-12">
          {title}
        </ModalHeader>
        <ModalBody>
          <div className="row col-12 mb-2 pb-2 pt-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
            <Col lg='3'>
              <label>Default Carrier:</label>
              <Input type="text" className="form-control-sm" value={this.props.default_carrier} />
            </Col>
            <Col lg='6'>
              <label>MinCarrier Composition:</label>
              <Input type="text" className="form-control-sm" value={this.props.description} />
            </Col>
            <Col lg='3'>
              <label>Average Rate:</label>
              <Input type="text" className="form-control-sm" value={formatAverageCost(this.props.average_rate)} />
            </Col>
          </div>
          <ReactTable
            manual
            data={this.props.data}
            columns={this.props.columns}
            defaultPageSize={10}
            onFilteredChange={(filter) => {
              let filters = [];
              filters.push(filter);
              this.handleChange("filter", filters)
            }}
            onSortedChange={(sort) => {
              let sorts = [];
              sorts.push(sort);
              this.handleChange("sort", sorts);
            }}
            onPageChange={(page) => {
              this.handleChange("page", page);
            }}
            onPageSizeChange={(pageSize) => {
              this.handleChange("pageSize", pageSize)
            }}
            minRows={this.props.data.length && this.props.data.length}
            pages={this.props.total_page}
            onFetchData={this.props.fetchData}
          />
        </ModalBody>
      </Modal>
    );
  }

  renderNavbar = (id, name) => {
    return  <NavItem>
      <NavLink className={classnames({active: this.state.activeTab === id})} onClick={() => {this.toggle(id);}}>
        <Label className="font-weight-bold"><span style={{fontSize: 15}}> {name}</span></Label>
      </NavLink>
    </NavItem>
  };

  toggle = (tab) => {this.state.activeTab !== tab && this.setState({activeTab: tab});};

  handleChange = (type, value) => {
    this.props.handler(type, value);
  }
}

export default ViewLCRModal
