import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, Col, Input, Row} from 'reactstrap';
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import withLoadingAndNotification, {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";
import RestApi from "../../service/RestApi";
import NotificationCategory from "../../constants/ServerNotificationCategory";
import {formatCost, formatDuration} from "../../components/utiles";
class ViewCDR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], page: 0, sort: [], filter: [],
      pageSize: 0, total_page: 0, files: '',
    }
  }

  componentDidMount() {
    this.subscribeNotification();
    this.getInfo();
  }

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
    if (!this.props.auth.token) {
      return;
    }
    const eventSource = new EventSource(process.env.REACT_APP_API_ENDPOINT + 'notification/subscribe?access_token=' + this.props.auth.token, {withCredentials: false});
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message && (data.category === NotificationCategory.CprGenCdrDipDone || data.category === NotificationCategory.CprGenCdrImportDone)){
          this.fetchData();
          this.getInfo();
        }
      } catch(ex){}
    };
    this.eventSource = eventSource
  };

  getInfo = () => {
    this.props.callApi(RestApi.getInfo, response => {
      if (response.ok) {
        let files = "";
        for (let i = 0; i< response.data.length; i++) {
          if (response.data[i].name) {
            (i === response.data.length - 1) ? files += response.data[i].name : files += response.data[i].name + ",\t";
          }
        }
        this.setState({files})
      }
    })
  };

  columns = [
    {
      Header: 'Row ANI',
      accessor: 'row_ani',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'LRN',
      accessor: 'lrn',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Calls',
      accessor: 'calls',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Total Duration M/S',
      accessor: 'total_duration',
      Cell: props => <div className="text-right">{formatDuration(props.value)}</div>
    },
    {
      Header: 'Total Cost',
      accessor: 'total_cost',
      filterable: true,
      Cell: props => <div className="text-center">{formatCost(props.value)}</div>
    },
    {
      Header: 'Average Cost',
      accessor: 'average_cost',
      filterable: true,
      Cell: props => <div className="text-center">{formatCost(props.value)}</div>
    },

  ];

  fetchData = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(this._fetchData, 500)
  };

  _fetchData = () => {
    let sorts = [];
    let filters = [];
    if (this.state.sort.length) {
      let sorted = this.state.sort;
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
    if (this.state.filter.length) {
      let filtered = this.state.filter;
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
      page: this.state.page,
      pageSize: this.state.pageSize === 0 ? 10 : this.state.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchCDR, response => {
      if (response.ok) {
        this.setState({data: response.data.rows, total_page: response.data.totalPages});
      }
    }, data);
  };

  deleteCdr = () => {
    this.props.callApi(RestApi.deleteCdrs, response => {
      if (response.ok) {
        this.getInfo();
        this.fetchData();
      }
    })
  };

  render() {
    return (
      <Row>
        <Col xs="12">
          <Card>
            <CardHeader>
              <Row className="mt-3">
                <Col lg="2"><strong className="card-title-big">View CDR </strong></Col>
                <Col lg="8">
                  <Input type="text" value={this.state.files} readOnly/>
                </Col>
                <Col lg="2">
                  <p className="text-right">
                    <Button size="md" color="danger" onClick={this.deleteCdr}>Delete All</Button>
                  </p>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <ReactTable
                manual
                data={this.state.data}
                columns={this.columns}
                defaultPageSize={10}
                onFilteredChange={(filter) => {
                  let filters = [];
                  filters.push(filter);
                  this.setState({filter: filters})
                }}
                onSortedChange={(sort) => {
                  let sorts = [];
                  sorts.push(sort);
                  this.setState({sort: sorts})
                }}
                onPageChange={(page) => {
                  this.setState({page})}
                }
                onPageSizeChange={(pageSize) => {this.setState({pageSize: pageSize})}}
                minRows={this.state.data.length && this.state.data.length}
                pages={this.state.total_page}
                onFetchData={this.fetchData}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default withAuthApiLoadingNotification(ViewCDR);
