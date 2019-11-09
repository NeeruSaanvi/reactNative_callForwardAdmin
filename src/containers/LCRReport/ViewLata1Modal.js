import React, {Component} from 'react'
import {Col, Modal, ModalHeader, Row, Input, Nav, NavItem, NavLink, Label, Button, TabPane, TabContent, Table} from "reactstrap";
import PropTypes from "prop-types";
import ModalBody from "reactstrap/es/ModalBody";
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import {formatAverageCost, formatCost, formatDuration, formatNumber} from "../../components/utiles";
import numeral from "numeral";
import classnames from "classnames";

class ViewLata1Modal extends Component {
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
    total_cost: PropTypes.number,
    total_duration: PropTypes.number,
    average_cost: PropTypes.number,
    invalid_npanxx_count: PropTypes.number,
    invalid_total_cost: PropTypes.number,
    invalid_total_duration: PropTypes.number,
    valid_npanxx_count: PropTypes.number,
    default_rate: PropTypes.number,
    compared_cdr_file_names: PropTypes.string,
    detail: PropTypes.arrayOf(PropTypes.object),
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
          <Nav tabs className="custom">
            {this.renderNavbar("1", "Rated Codes")}
            {this.renderNavbar("2", "Un-Rated Codes")}
            {this.renderNavbar("3", "Total Codes")}
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Total Duration M/S:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatDuration(total_duration)} />
                </Col>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Total Cost:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatCost(this.props.total_cost)} />
                </Col>
                <Col lg='6' className="row mt-1">
                  <label className="col-6 text-right">Total NPANXX Count:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatNumber(this.props.valid_npanxx_count)} />
                </Col>
                <Col lg='6' className="row mt-1">
                  <label className="col-6 text-right">Average Cost:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatAverageCost(this.props.average_cost)} />
                </Col>
              </Row>
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg="12" className="row mt-1">
                  <label className="col-2 text-right">Compared CDR Files:</label>
                  <Input type="text" className="col-10 form-control-sm" value={this.props.compared_cdr_file_names} />
                </Col>
              </Row>
              <Row>
                <Col lg="12">
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
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Total Duration M/S:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatDuration(this.props.invalid_total_duration)} />
                </Col>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Total Cost:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatCost(this.props.invalid_total_cost)} />
                </Col>
                <Col lg='6' className="row mt-1">
                  <label className="col-6 text-right">Total NPANXX Count:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatNumber(this.props.invalid_npanxx_count)} />
                </Col>
                <Col lg='6' className="row mt-1">
                  <label className="col-6 text-right">Default Rate:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatAverageCost(this.props.default_rate)} />
                </Col>
              </Row>
              <Row>
                <Col lg="12">
                  <ReactTable
                    manual
                    data={this.props.data2}
                    columns={this.props.columns2}
                    defaultPageSize={10}
                    onFilteredChange={(filter) => {
                      let filters = [];
                      filters.push(filter);
                      this.handleChange("filter2", filters)
                    }}
                    onSortedChange={(sort) => {
                      let sorts = [];
                      sorts.push(sort);
                      this.handleChange("sort2", sorts);
                    }}
                    onPageChange={(page) => {
                      this.handleChange("page2", page);
                    }}
                    onPageSizeChange={(pageSize) => {
                      this.handleChange("pageSize2", pageSize)
                    }}
                    minRows={10}
                    pages={this.props.total_page2}
                    onFetchData={this.props.fetchData2}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Table className="table table-bordered table-responsive-lg">
                <tr>
                  <th className='text-center'>Carrier</th>
                  <th className='text-center'>NPANXX Count</th>
                  <th className='text-center'>Total Duration M/S</th>
                  <th className='text-center'>Total Cost</th>
                  <th className='text-center'>Average Cost</th>
                </tr>
                {this.props.detail && this.props.detail.map(detail => {
                  return <tr>
                    <td className='text-center'>{detail.carrier}</td>
                    <td className='text-right'>{detail.count}</td>
                    <td className='text-right'>{detail.duration}</td>
                    <td className='text-right'>{formatCost(detail.cost)}</td>
                    <td className='text-right'>{formatAverageCost(detail.average_cost)}</td>
                  </tr>
                })}
              </Table>
            </TabPane>.
          </TabContent>
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

export default ViewLata1Modal
