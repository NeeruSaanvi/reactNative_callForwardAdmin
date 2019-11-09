import React, {Component} from 'react';
import {Card, CardBody, Col, Row} from 'reactstrap';
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import withLoadingAndNotification, {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";
import {cardHeader} from '../../components/Card/CollapsibleCardHeader';
import RestApi from "../../service/RestApi";
import NotificationCategory from "../../constants/ServerNotificationCategory";

const Header = cardHeader(true, false);
class ViewLerg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], page: 0, sort: [], filter: [],
      pageSize: 0, total_page: 0
    }
  }

  componentDidMount() {
    this.subscribeNotification();
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
        if (data.message && data.category === NotificationCategory.CprGenRGLEImport2Done){
          this.fetchData();
        }
      } catch(ex){}
    };
    this.eventSource = eventSource
  };

  columns = [
    {
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'NPA',
      accessor: 'npa',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'NXX',
      accessor: 'nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'NPANXX-X',
      accessor: 'npa_nxxx',
      filterable: true,
      Cell: (row) => {
        return <div className="text-center">{row.row.npa_nxxx}</div>
      }
    },
    {
      Header: 'State',
      accessor: 'state',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'LATA',
      accessor: 'lata',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'OCN',
      accessor: 'ocn',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Carrier',
      accessor: 'carrier',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'ACNA',
      accessor: 'acna',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'CIC',
      accessor: 'cic',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'ACNA-CIC',
      accessor: 'acna_cic',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
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
    this.props.callApi(RestApi.searchLerg, response => {
      if (response.ok) {
        this.setState({data: response.data.rows, total_page: response.data.totalPages});
      }
    }, data);
  };

  render() {
    return (
      <Row>
        <Col xs="12">
          <Card>
            <Header>View RGLE</Header>
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

export default withAuthApiLoadingNotification(ViewLerg);
