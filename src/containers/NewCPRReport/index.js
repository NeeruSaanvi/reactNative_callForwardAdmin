import React, {Component} from 'react';
import {Button, Card, CardBody, Col, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane} from 'reactstrap';
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";
import {cardHeader} from '../../components/Card/CollapsibleCardHeader';
import RestApi from "../../service/RestApi";
import './style.css'
import CardHeader from "reactstrap/es/CardHeader";
import produce from "immer";
import CardFooter from "reactstrap/es/CardFooter";
import FormGroup from "reactstrap/es/FormGroup";
import FormFeedback from "reactstrap/es/FormFeedback";
import ViewLADModal from './ViewLADModal';
import {formatDate} from "../../components/utiles";
import classnames from "classnames";

const Header = cardHeader(true, false);
class NewCPRReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lcrReportList: [], reportName: "", isReportName: false, name: '', isName: '', lcrList: [], isLcr: false, selectedLcr: '',
      lata2list: [], selectLata: '', isLata: false,
      data: [], page: 0, sort: [], filter: [], defaultRate: 0, isDefaultRate: false,
      pageSize: 0, total_page: 0,activeTab: '1',
      lad: {
        data: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0,
      },
      modal: {
        isOpen: false,
        data: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0, id: null, states: [],
        latas: [], npanxxs:[], carriers: [], npalist: [],
        state:'', lata: '', npanxx: '', carrier: '',
      },
    }
  }

  componentDidMount() {
    this.subscribeNotification();
    this.props.callApi(RestApi.getLCRReportList, response => {
      if (response.ok) {
        this.setState({lcrReportList: response.data});
      }
    });
    this.props.callApi(RestApi.getLataList2, res => {
      if (res.ok) {
        this.setState({lata2list: res.data})
      }
    })
  };

  componentWillUnmount() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }
  subscribeNotification = () => {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    if (!this.props.auth.token) return;
    const eventSource = new EventSource(process.env.REACT_APP_API_ENDPOINT + 'notification/subscribe?access_token=' + this.props.auth.token, {withCredentials: false});
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message){
          this.fetchLAD();
        }
      } catch(ex){}
    };
    this.eventSource = eventSource
  };

  cprgenReport = () => {
    if (this.state.reportName === "") {this.setState({isReportName: true});return false;}
    if (this.state.selectedLcr === "") {this.setState({isLcr: true}); return false;}
    if (this.state.defaultRate === 0) {this.setState({isDefaultRate: true}); return false;}
    this.props.callApi(RestApi.createNewCPRReport, res => {
    }, {lcrReportId: this.state.selectedLcr, name: this.state.reportName, defaultRate: parseFloat(this.state.defaultRate)});
  };

  viewLAD = (id, summary) => {
    summary = summary.split(";");
    this.props.callApi(RestApi.searchNewCPRReportData1, res => {
      if (res.ok) {
        let { carriers, latas, npanxxs } = res.data;
        let npa = npanxxs.slice(0);
        latas.unshift("");
        npanxxs.unshift("");
        let npalist = [];
        console.log(npa);
        while (npa.length) npalist.push(npa.splice(0, 10));
        this.setState({modal: produce(this.state.modal, m=> {
            m.isOpen = true; m.id = id; m.states = summary; m.carriers = carriers;
            m.latas = latas; m.state = summary[0]; m.npanxxs = npanxxs;
            m.npalist = npalist;
          })
        });
      }
    }, id, {
      state: summary[0].substring(0, 2)
    });

  };

  ladColumns = [
    {
      Header: 'Name',
      accessor: 'name',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Used LATA/NPANXX 2 Report Name',
      accessor: 'second_report_name',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Created At',
      accessor: 'created_at',
      Cell: props => <div className='text-center'>{formatDate(props.value)}</div>
    },
    {
      Header: 'Updated At',
      accessor: 'updated_at',
      Cell: props => <div className='text-center'>{formatDate(props.value)}</div>
    },
    {
      Header: 'Action',
      accessor: 'id',
      width: 400,
      Cell: props => <div className="text-center">
        <Button size="sm" color="primary" onClick={() => this.viewLAD(props.value, props.original.v1_summary)}>View</Button>
        <Button size="sm" color="danger" onClick={() => this.deleteItem(props.value)} className="ml-2">Delete</Button>
      </div>
    },
  ];

  deleteItem = (id) => {
    this.props.callApi(RestApi.deleteNewCPRReport, res => {
      if (res.ok) {
        this.fetchLAD();
      }
    }, id)
  };

  fetchData = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(()=>this._fetchData(), 500)
  };
  _fetchData = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal.sort.length) {
      let sorted = this.state.modal.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      let sort = {
        "column": column,
        "direction": direction
      };
      sorts.push(sort)
    }
    if (this.state.modal.filter.length) {
      let filtered = this.state.modal.filter;
      filtered = filtered[0];
      let filter = {};
      for (let i = 0; i < filtered.length; i++) {
        filter = {
          "column": filtered[i].id,
          "contains": filtered[i].value
        };
        filters.push(filter);
      }
    }
    let data = {
      page: this.state.modal.page,
      pageSize: this.state.modal.pageSize === 0 ? 10 : this.state.modal.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchNewCPRReportData1, response => {
      if (response.ok) {
        console.log(response.data);
        this.setState({modal: produce(this.state.modal, m=> {
            m.data= response.data.rows;
            m.total_page = response.data.totalPages;
          })})
      }
    }, this.state.modal.id, data);
  };
  fetchLAD = () => {
    this.fetchTime && clearTimeout(this.fetchTime);
    this.fetchTime = setTimeout(this._fetchLAD, 500)
  };

  _fetchLAD = () => {
    let sorts = [];
    let filters = [];
    if (this.state.lad.sort.length) {
      let sorted = this.state.lad.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      let sort = {
        "column": column,
        "direction": direction
      };
      sorts.push(sort)
    }
    if (this.state.lad.filter.length) {
      let filtered = this.state.lad.filter;
      filtered = filtered[0];
      let filter = {};
      for (let i = 0; i < filtered.length; i++) {
        filter = {
          "column": filtered[i].id,
          "contains": filtered[i].value
        };
        filters.push(filter);
      }
    }
    let data = {
      page: this.state.lad.page,
      pageSize: this.state.lad.pageSize === 0 ? 10 : this.state.lad.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchNewCPRReport, response => {
      if (response.ok) {
        console.log(response.data);
        this.setState({lad: produce(this.state.lad, m=> {
            m.data= response.data.rows;
            m.total_page = response.data.totalPages;
          })})
      }
    }, data);
  };

  viewLCRData = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(this._viewLCRData, 500)
  };

  _viewLCRData = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal.sort.length) {
      let sorted = this.state.modal.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      let sort = {
        "column": column,
        "direction": direction
      };
      sorts.push(sort)
    }
    if (this.state.modal.filter.length) {
      let filtered = this.state.modal.filter;
      filtered = filtered[0];
      let filter = {};
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].id === "role") {
          if (filtered[i].value === "all") {
            filter = {};
          } else {
            filter = {
              "column": "role_id",
              "exact": filtered[i].value
            }
          }
        } else {
          filter = {
            "column": filtered[i].id,
            "contains": filtered[i].value
          };
        }
        filters.push(filter);
      }
    }
    let data = {
      page: this.state.modal.page,
      pageSize: this.state.modal.pageSize === 0 ? 10 : this.state.modal.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.getCprReportDataById, response => {
      if (response.ok) {
        this.setState({
          modal: produce(this.state.modal, m => {
            m.data = response.data.rows;
            m.total_page = response.data.totalPages
          })
        })
      }
    }, this.state.modal.id, data);
  };

  handleRefresh = () => {this.fetchLAD()};

  handleUpdate = (type, value) => {
    console.log(type, value);
    this.setState({
      modal: produce(this.state.modal, m => {
        m[type] = value
      })
    })
  };


  toggleModal = () => {
    const modal = produce(this.state.modal, m => {
      m.isOpen = !m.isOpen;
    });
    this.setState({modal});
  };

  toggleLADModal = () => {
    const modal = produce(this.state.ladModal, m => {
      m.isOpen = !m.isOpen;
    });
    this.setState({ladModal: modal});
  };
  toggle = (tab) => {this.state.activeTab !== tab && this.setState({activeTab: tab});};

  ladGeneration = () => {
    if (this.state.selectLata === "") {
      this.setState({isLATA: true});
      return false;
    }
    if (this.state.name === "") {
      this.setState({isName: true});
      return false;
    }
    this.props.callApi(RestApi.createNewCPRReport, response => {},
      {
        secondReportId: this.state.selectLata,
        name: this.state.name
      })
  };


  render() {
    return (
      <Row>
        <Col lg="12">
          <Card>
            <Header>CPR Report Generation</Header>
            <CardBody>
              <FormGroup row>
                <Col lg="4" className="row">
                  <Col lg="6" className="text-right">
                    <Label className="font-weight-bold">CPR Report Name:</Label>
                  </Col>
                  <Col lg="6">
                    <Input type="text" onChange={(ev)=> {this.setState({name: ev.target.value, isName: false});
                    }} className="form-control-sm" invalid={this.state.isReportName}/>
                    {this.state.isName ? <FormFeedback>Please input name!</FormFeedback> : ""}
                  </Col>
                </Col>
                <Col lg="6" className="row">
                  <Col lg="6" className="text-right">
                    <Label className="font-weight-bold">LATA/NPANXX 2 List:</Label>
                  </Col>
                  <Col lg="6">
                    <Input type="select" onChange={(ev)=> {this.setState({selectLata: ev.target.value, isLata: false});
                    }} className="form-control-sm" invalid={this.state.isLata} required>
                      <option value=""/>
                      {this.state.lata2list.map(({id, name}) => {
                        return <option value={id}>{name}</option>
                      })}
                    </Input>
                    {this.state.isLata ? <FormFeedback>Please select LATA/NPANXX 2 report!</FormFeedback> : ""}
                  </Col>
                </Col>
              </FormGroup>
            </CardBody>
            <CardFooter>
              <Button size="md" color="primary" onClick={this.ladGeneration}>Generation CPR Report</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Row>
                <Col><strong className="card-title-big">CPR Report List</strong></Col>
                <Col>
                  <div className="text-right">
                    <Button size="md" color="link" onClick={this.handleRefresh}><i className="fa fa-refresh"/> Refresh</Button>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <ReactTable
                manual
                data={this.state.lad.data}
                columns={this.ladColumns}
                defaultPageSize={10}
                onFilteredChange={(filter) => {
                  let filters = [];
                  filters.push(filter);
                  this.setState({lad: produce(this.state.lad, m=> {
                      m.filter = filters;
                    })});
                }}
                onSortedChange={(sort) => {
                  let sorts = [];
                  sorts.push(sort);
                  this.setState({lad: produce(this.state.lad, m=> {
                      m.sort = sorts;
                    })});
                }}
                onPageChange={
                  (page)=>this.setState({lad: produce(this.state.lad, m=> {
                      m.page = page;
                    })})
                }
                onPageSizeChange={(pageSize) => this.setState({lad: produce(this.state.lad, m=> {
                    m.pageSize = pageSize;
                  })})}
                minRows={this.state.lad.data.length && this.state.lad.data.length}
                pages={this.state.lad.total_page}
                onFetchData={this.fetchLAD}
              />
            </CardBody>
          </Card>
        </Col>
        <ViewLADModal
          isOpen={this.state.modal.isOpen}
          toggle={this.toggleModal}
          id={this.state.modal.id}
          handler={this.handleUpdate}
          data={this.state.modal}
        />
        <form ref={(node)=> {this.downloadForm = node}} action="" target="_blank" method="post">
          <input type="hidden" ref={(input)=> {this.textInput = input}} name="access_token" value=""/>
        </form>
      </Row>
    );
  }

  renderNavbar = (id, name) => {
    return  <NavItem>
      <NavLink className={classnames({active: this.state.activeTab === id})} onClick={() => {this.toggle(id);}}>
        <Label className="font-weight-bold"><span style={{fontSize: 22}}> {name}</span></Label>
      </NavLink>
    </NavItem>
  };
}

export default withAuthApiLoadingNotification(NewCPRReport);
