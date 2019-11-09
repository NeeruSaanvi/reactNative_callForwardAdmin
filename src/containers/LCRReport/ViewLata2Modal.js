import React, {Component} from 'react'
import {Col, Modal, ModalHeader, Row, Input, NavLink, Label, NavItem, Nav, TabContent, TabPane, Button, Table} from "reactstrap";
import PropTypes from "prop-types";
import ModalBody from "reactstrap/es/ModalBody";
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import classnames from "classnames";
import {formatAverageCost, formatCost, formatDuration, formatNumber} from "../../components/utiles";
import numeral from "numeral";

class ViewLata2Modal extends Component {
  static propTypes = {
    data: PropTypes.object,
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    column2: PropTypes.arrayOf(PropTypes.object),
    column3: PropTypes.arrayOf(PropTypes.object),
    column4: PropTypes.arrayOf(PropTypes.object),
    fetchData2: PropTypes.func,
    fetchData3: PropTypes.func,
    fetchData4: PropTypes.func,
    fetchData5: PropTypes.func,
    total_page: PropTypes.number,
    handler: PropTypes.func,
    ...Modal.propTypes,
  };

  static defaultProps = {
    isEditable: true
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      detailData: []
    }
  }

  render() {
    let {v2_carriers_detail} = this.props.data;
    if (v2_carriers_detail) {
      v2_carriers_detail = v2_carriers_detail.split("|");
    }

    console.log(this.props.data.detail)
    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader toggle={this.props.toggle} className="col-12">
          View LATA/NPANXX Report 2
        </ModalHeader>
        <ModalBody>

          <Nav tabs className="custom">
            {this.renderNavbar("1", "DEFAULT")}
            {this.renderNavbar("2", "OTHER")}
            {this.renderNavbar("3", "TOP 33K")}
            {this.renderNavbar("4", "FINAL")}
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Default Carrier:</label>
                  <Input type="text" className="col-6 form-control-sm" value={this.props.data.default_carrier} />
                </Col>
              </Row>
              <Row className="col-12 mb-2 pt-2 pb-2 mt-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Total Duration M/S:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatDuration(this.props.data.v1_total_duration)} />
                </Col>
                <Col lg='6' className="row">
                  <label className="col-6 text-right">Total Cost:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatCost(this.props.data.v1_total_cost)} />
                </Col>
                <Col lg='6' className="row mt-1">
                  <label className="col-6 text-right">Average Cost:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatAverageCost(this.props.data.v1_average_cost)} />
                </Col>
                <Col lg='6' className="row mt-1">
                  <label className="col-6 text-right">NPANXX Count:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatNumber(this.props.data.default_carrier_count)} />
                </Col>
              </Row>
              <div className="text-right mt-2 mb-2">
                <Button size="sm" color="success" className="ml-2" onClick={() => {
                  this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/lata_npanxx_report_2/view1/" + this.props.data.id + "/download";
                  this.textInput.value = this.props.data.token;
                  this.downloadForm.submit();
                  this.textInput.value = "";
                }}>Download</Button>
              </div>
              <Row>
                <Col lg="12">
                  <ReactTable
                    manual
                    data={this.props.data.data2}
                    columns={this.props.column2}
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
                    minRows={this.props.data.data2.length && this.props.data.data2.length}
                    pages={this.props.data.total_page2}
                    onFetchData={this.props.fetchData2}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='4' className="row">
                  <label className="col-5 text-right">Total Duration M/S:</label>
                  <Input type="text" className="col-7 form-control-sm" value={formatDuration(this.props.data.v2_total_duration)} />
                </Col>
                <Col lg='4' className="row">
                  <label className="col-5 text-right">Total Cost:</label>
                  <Input type="text" className="col-7 form-control-sm" value={formatCost(this.props.data.v2_total_cost)} />
                </Col>
                <Col lg='4' className="row">
                  <label className="col-5 text-right">Average Cost:</label>
                  <Input type="text" className="col-7 form-control-sm" value={formatAverageCost(this.props.data.v2_average_cost)} />
                </Col>
              </Row>
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='4' className="row">
                  <label className="col-7 text-right">Second Top Carrier:</label>
                  <Input type="text" className="col-5 form-control-sm" value={this.props.data.v2_default_carrier} />
                </Col>
                <Col lg='8' className="row">
                  <label className="col-3 text-right">Carriers Detail:</label>
                  <textarea className="col-9 form-control" rows={4} value={v2_carriers_detail && v2_carriers_detail.join('\n')} />
                </Col>
              </Row>
              <div className="text-right mt-2 mb-2">
                <Button size="sm" color="success" className="ml-2" onClick={() => {
                  this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/lata_npanxx_report_2/view2/" + this.props.data.id + "/download";
                  this.textInput.value = this.props.data.token;
                  this.downloadForm.submit();
                  this.textInput.value = "";
                }}>Download</Button>
              </div>
              <Row>
                <Col lg="12">
                  <ReactTable
                    manual
                    data={this.props.data.data3}
                    columns={this.props.column3}
                    defaultPageSize={10}
                    onFilteredChange={(filter) => {
                      let filters = [];
                      filters.push(filter);
                      this.handleChange("filter3", filters)
                    }}
                    onSortedChange={(sort) => {
                      let sorts = [];
                      sorts.push(sort);
                      this.handleChange("sort3", sorts);
                    }}
                    onPageChange={(page) => {
                      this.handleChange("page3", page);
                    }}
                    onPageSizeChange={(pageSize) => {
                      this.handleChange("pageSize3", pageSize)
                    }}
                    minRows={this.props.data.data3.length && this.props.data.data3.length}
                    pages={this.props.data.total_page3}
                    onFetchData={this.props.fetchData3}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='4' className="row">
                  <label className="col-6 text-right">Total Duration M/S:</label>
                  <Input type="text" className="col-6 form-control-sm" value={formatDuration(this.props.data.v3_total_duration)} />
                </Col>
                <Col lg='4' className="row">
                  <label className="col-5 text-right">Total Cost:</label>
                  <Input type="text" className="col-7 form-control-sm" value={formatCost(this.props.data.v3_total_cost)} />
                </Col>
                <Col lg='4' className="row">
                  <label className="col-5 text-right">Average Cost:</label>
                  <Input type="text" className="col-7 form-control-sm" value={formatAverageCost(this.props.data.v3_average_cost)} />
                </Col>
              </Row>
              <Row className="col-12 mb-2 pt-2 pb-2" style={{backgroundColor: '#f0f3f5', marginLeft: 1}}>
                <Col lg='12' className="row">
                  <label className="col-2 text-right">Winning Carriers:</label>
                  <Input type="text" className="col-10 form-control-sm" value={this.props.data.v3_winning_carriers} />
                </Col>
              </Row>
              <div className="text-right mt-2 mb-2">
                <Button size="sm" color="success" className="ml-2" onClick={() => {
                  this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/lata_npanxx_report_2/view3/" + this.props.data.id + "/download/" + this.props.data.default_carrier;
                  this.textInput.value = this.props.data.token;
                  this.downloadForm.submit();
                  this.textInput.value = "";
                }}>Download</Button>
              </div>
              <Row>
                <Col lg="12">
                  <ReactTable
                    manual
                    data={this.props.data.data4}
                    columns={this.props.column4}
                    defaultPageSize={10}
                    onFilteredChange={(filter) => {
                      let filters = [];
                      filters.push(filter);
                      this.handleChange("filter4", filters)
                    }}
                    onSortedChange={(sort) => {
                      let sorts = [];
                      sorts.push(sort);
                      this.handleChange("sort4", sorts);
                    }}
                    onPageChange={(page) => {
                      this.handleChange("page4", page);
                    }}
                    onPageSizeChange={(pageSize) => {
                      this.handleChange("pageSize4", pageSize)
                    }}
                    minRows={this.props.data.data4.length && this.props.data.data4.length}
                    pages={this.props.data.total_page4}
                    onFetchData={this.props.fetchData4}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="4">
              <Table className="table table-bordered table-responsive-lg">
                <tr>
                  <th className='text-center'>Category</th>
                  <th className='text-center'>Carrier</th>
                  <th className='text-center'>NPANXX Count</th>
                  <th className='text-center'>Total Duration M/S</th>
                  <th className='text-center'>Total Cost</th>
                  <th className='text-center'>Average Cost</th>
                </tr>
                {this.props.data.detail && this.props.data.detail.map(detail => {
                  return <tr>
                    <td className='text-center'>{detail.category}</td>
                    <td className='text-center'>{detail.carrier}</td>
                    <td className='text-right'>{detail.count}</td>
                    <td className='text-right'>{detail.duration}</td>
                    <td className='text-right'>{formatCost(detail.cost)}</td>
                    <td className='text-right'>{formatAverageCost(detail.average_cost)}</td>
                  </tr>
                })}

              </Table>
              <div className="text-right mt-2 mb-2">
                <Button size="sm" color="success" className="ml-2" onClick={() => {
                  this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/lata_npanxx_report_2/view4/" + this.props.data.id + "/download";
                  this.textInput.value = this.props.data.token;
                  this.downloadForm.submit();
                  this.textInput.value = "";
                }}>Download</Button>
              </div>
              <Row>
                <Col lg="12">
                  <ReactTable
                    manual
                    data={this.props.data.data5}
                    columns={this.props.column5}
                    defaultPageSize={10}
                    onFilteredChange={(filter) => {
                      let filters = [];
                      filters.push(filter);
                      this.handleChange("filter5", filters)
                    }}
                    onSortedChange={(sort) => {
                      let sorts = [];
                      sorts.push(sort);
                      this.handleChange("sort5", sorts);
                    }}
                    onPageChange={(page) => {
                      this.handleChange("page5", page);
                    }}
                    onPageSizeChange={(pageSize) => {
                      this.handleChange("pageSize5", pageSize)
                    }}
                    minRows={this.props.data.data5.length && this.props.data.data5.length}
                    pages={this.props.data.total_page5}
                    onFetchData={this.props.fetchData5}
                  />
                </Col>
              </Row>
            </TabPane>
          </TabContent>
          <form ref={(node)=> {this.downloadForm = node}} action="" target="_blank" method="post">
            <input type="hidden" ref={(input)=> {this.textInput = input}} name="access_token" value=""/>
          </form>
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

  handleChange = (type, value) => {
    this.props.handler(type, value);
  };

  toggle = (tab) => {this.state.activeTab !== tab && this.setState({activeTab: tab});};

}

export default ViewLata2Modal;
