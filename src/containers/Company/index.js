import React, { Component, Fragment } from 'react'
import withLoadingAndNotification from "../../components/HOC/withLoadingAndNotification";
import { Badge, Button, Card, Col, Row } from 'reactstrap'
import CardHeader from "reactstrap/es/CardHeader";
import CardBody from "reactstrap/es/CardBody";
import ReactTable from 'react-table';
import '../../scss/react-table.css'
import CompanyModal from "./CompanyModal";
import RestApi from "../../service/RestApi";
import { connect } from "react-redux";
import companyEntity from './companyEntity';
import { formatDate } from "../../components/utiles";
import Privileges from "../../constants/Privileges";

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: {
        show: false,
      },
      company: companyEntity,
      type: "Add",
      companyList: []
    };
  }

  filterData = {
    page: 0,
    pageSize: 10,
    sorts: [],
    filters: []
  };

  componentDidMount() {
    this.listAllCompany();
  }

  addCompany = () => {
    this.setState({ modal: { show: true }, type: "Add" });
  }

  editCompany = (id) => {
    this.props.callApi(RestApi.findByCompanyId, response => {
      if (response.ok) {
        let company = response.data;
        if(!company.user.roId) company.user.roId = "";
        if(!company.user.profile) {
          company.user.profile = {
            mobile: ""
          }
        }
        this.setState({ modal: { show: true }, type: "Edit", company });
      }
    }, id);
  }

  listAllCompany = () => {
    this.props.callApi(RestApi.searchAllCompany, response => {
      if (response.ok) {
        this.setState({modal: {
          show: false,
        }, companyList: response.data.rows})
      }
    }, this.filterData);
  }

  onHide = () => {
    this.listAllCompany();
  }

  viewCompany = (id) => {
    this.props.callApi(RestApi.findByCompanyId, response => {
      if (response.ok) {

      }
    }, id);
  }

  deleteCompany = (id, index) => {
    let confirm = window.confirm("Are you sure to delete company?");
    if (confirm) {
      this.props.callApi(RestApi.deleteCompany, response => {
        if (response.ok) {
          this.listAllCompany();
        }
      }, id);
    }
  }

  activateCompany = (id, index) => {
    this.props.callApi(RestApi.activateCompany, response => {
      if (response.ok) {
        let company = Object.assign([], this.state.companyList);
        company[index].is_active = true;
        this.setState({companyList: company});
      }
    }, id);
  }

  deactivateCompany = (id, index) => {
    this.props.callApi(RestApi.deactivateCompany, response => {
      if (response.ok) {
        let company = Object.assign([], this.state.companyList);
        company[index].is_active = false;
        this.setState({companyList: company});
      }
    }, id);
  }

  handleRefresh = () => {
    this.setState({modal: {show: false}})
    this.props.callApi(RestApi.searchAllCompany, response => {
      if (response.ok) {
        this.setState({companyList: response.data.rows})
      }
    }, this.filterData);
  }

  columns = [
    {
      Header: 'Name',
      filterable: true,
      accessor: 'name',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Code',
      filterable: true,
      accessor: 'code',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Role Code',
      filterable: true,
      accessor: 'roleCode',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Resp Org Id',
      accessor: 'resp_org_id',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Email',
      accessor: 'email',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>,
      width: 200,
    },
    {
      Header: 'Status',
      accessor: 'is_active',
      Cell: (row) => {
        return <div className="text-center">
          {row.row.is_active && <Badge className="mr-1" color="success">Active</Badge>}
          {!row.row.is_active && <Badge className="mr-1" color="secondary">Inactive</Badge>}
        </div>
      }
    },
    {
      Header: 'Created At',
      accessor: 'created_at',
      Cell: props => <div className='text-center'>{formatDate(props.value)}</div>,
      width: 200
    },
    {
      Header: 'Updated At',
      accessor: 'updated_at',
      Cell: props => <div className='text-center'>{formatDate(props.value)}</div>,
      width: 200
    },
    {
      Header: 'Created By',
      accessor: 'created_by',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Updated By',
      accessor: 'updated_by',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Action',
      accessor: 'id',
      Cell: (row) => {
        let id = row.row.id;
        let active = row.row.is_active;
        return <div className="text-center">
          {active && this.props.isSuperAdmin && <span color="link" className="mr-2" onClick={() => this.deactivateCompany(id, row.index)}>
            <i className="fa fa-eye" />
          </span>}
          {!active && this.props.isSuperAdmin && <span color="link" className="mr-2" onClick={() => this.activateCompany(id, row.index)}>
            <i className="fa fa-eye-slash" />
          </span>}
          { this.props.privileges.includes(Privileges.WriteCompany) && 
            <Fragment>
              <span color="link" className="mr-2" onClick={() => this.editCompany(id)}>
                <i className="fa fa-edit" />
              </span>
            </Fragment>
          }
          { this.props.isSuperAdmin && 
              <span color="link" onClick={() => this.deleteCompany(id, row.index)}>
                <i className="fa fa-trash" />
              </span>
          }
        </div>
      }
    },
  ];

  render() {
    return (
      <Fragment>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <Row>
                  <Col><strong className="card-title-big">Company Management</strong></Col>
                  <Col>
                    <div className="text-right">
                      { this.props.isSuperAdmin &&
                        <Fragment> 
                          <Button size="md" color="link" onClick={this.addCompany}>
                            <i className="fa fa-plus" /> Add New Company
                          </Button>
                        </Fragment> 
                      }
                        <Button size="md" color="link" onClick={this.handleRefresh}>
                          <i className="fa fa-refresh" /> Refresh
                        </Button>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <ReactTable
                  manual
                  data={this.state.companyList}
                  columns={this.columns}
                  defaultPageSize={10}
                  minRows={1}
                  filterable
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <CompanyModal
          modal={this.state.modal}
          company={this.state.company}
          type={this.state.type}
          onHide={this.onHide}
        />
      </Fragment>
    )
  }
}

export default connect(state => ({ 
  roles: state.auth.profile.roles,
  privileges: state.auth.privileges,
  isSuperAdmin: state.auth.profile.isSuperAdmin
}))(withLoadingAndNotification(Company))
