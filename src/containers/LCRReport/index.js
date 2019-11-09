import React, {Component} from 'react';
import {Button, Card, CardBody, Col, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane} from 'reactstrap';
import ReactTable from 'react-table'
import '../../scss/react-table.css'
import {withAuthApiLoadingNotification} from "../../components/HOC/withLoadingAndNotification";
import RestApi from "../../service/RestApi";
import './style.css'
import CardHeader from "reactstrap/es/CardHeader";
import classnames from "classnames";
import produce from "immer";
import MultiSelectList from "../../components/MultiSelectList";
import ViewLCRModal from './ViewLCRModal'
import ViewLata2Modal from './ViewLata2Modal';
import ViewLata1Modal from './ViewLata1Modal';
import DeleteRateModal from './DeleteModal'
import RenameRateModal from './RenameModal'
import {Type} from "../../constants/Notifications";
import FormGroup from "reactstrap/es/FormGroup";
import FormFeedback from "reactstrap/es/FormFeedback";
import NotificationCategory from "../../constants/ServerNotificationCategory";
import {formatAverageCost, formatCost, formatDate, formatDuration, formatNumber} from "../../components/utiles";

class LCRReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rateNames: [], all: [], reportName: "", isReportName: false,
      chooseRateNames: [], choose: [],
      data: [], page: 0, sort: [], filter: [],
      pageSize: 0, total_page: 0,activeTab: '1',
      modal: {
        isOpen: false,
        data: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0, id: null, default_carrier: null, description: null,
      },
      modal1: {
        isOpen: false,
        data: [], page: 0, sort: [], filter: [], pageSize: 0, total_page: 0, id: null,
        data2: [], page2: 0, sort2: [], filter2: [], pageSize2: 0, total_page2: 0,
        total_duration: null, total_cost: null, average_cost: null,
        compared_cdr_file_names: null
      },
      modal2: {
        isOpen: false,
        data2: [], page2: 0, sort2: [], filter2: [],
        pageSize2: 0, total_page2: 0,
        data3: [], page3: 0, sort3: [], filter3: [],
        pageSize3: 0, total_page3: 0,
        data4: [], page4: 0, sort4: [], filter4: [],
        pageSize4: 0, total_page4: 0,
        data5: [], page5: 0, sort5: [], filter5: [],
        pageSize5: 0, total_page5: 0,
        id2: null, id3: null, id4: null, total_cost2: 0, total_cost3: 0, total_cost4: 0,
        total_duration2: 0, total_duration3: 0, total_duration4: 0, average_cost3: 0, average_cost4: 0,
        default_carrier: '', winning_carriers: ''
      },
      lata: {
        data: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0,
      },
      lata2: {
        data: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0,
      },
      deleteModal: {isOpen: false, data: []},
      renameModal: {isOpen: false, data: []},
      selectedRate: {}, originalData: [], isLcr: false,
      lataNpanxxReportName1: "", isLataReportName1: false,
      lataNpanxxReportName2: '', isLataReportName2: false,
      defaultRate: 0.0, isDefaultRate: false,
      lcrReportList: [], isLcrReport: false, selectedLcr: "", lata1List:[],
      selectedLata1: '', isLata1Report: false,
    }
  }

  componentDidMount() {
    this.subscribeNotification();
    this.getRateDeck();
    this.getLcrLists();
    this.getLata1List();
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
        if (data.message && (data.category === NotificationCategory.CprGenLataNpaNxxReport1Done || data.category === NotificationCategory.CprGenLataNpaNxxReport2Done || data.category === NotificationCategory.CprGenLcrReportDone)){
          this.getRateDeck();
          this.getLcrLists();
          this.getLata1List();
          this.fetchLataNpanxx2();
          this.fetchLataNpanxx1();
          this.fetchLcrReport();
        }
      } catch(ex){}
    };
    this.eventSource = eventSource
  };

  getLata1List = () => {
    this.props.callApi(RestApi.getLata1List, response => {
      if (response.ok) this.setState({lata1List: response.data});
    })
  };

  getRateDeck = () => {
    this.props.callApi(RestApi.getRateDeckList, response => {
      if (response.ok) this.setState({rateNames: response.data.map((v) => v.name), chooseRateNames: [], originalData: response.data});
    })
  };

  getLcrLists = () => {
    this.props.callApi(RestApi.getLCRReportList, response => {
      if (response.ok) this.setState({lcrReportList: response.data});
    })
  };

  add = () => {
    let all = this.state.all;
    if (all.length === 0) this.props.showNotification(Type.WARNING, "Please input Rate Deck!");
    let allRateNames = this.state.rateNames;
    let chooseRateNames = this.state.chooseRateNames;
    for (let j = 0; j < allRateNames.length; j++) {
      for (let i = 0; i< all.length; i++) {
        const index = allRateNames.indexOf(all[i]);
        if (index !== -1) {
          allRateNames.splice(index, 1);
          chooseRateNames.push(all[i]);
        }
      }
    }
    this.setState({
      rateNames: allRateNames, chooseRateNames, all: [], choose: [],
      renameModal: produce(this.state.renameModal, m => {m.data = ""}),
      deleteModal: produce(this.state.deleteModal, m => {m.data = ""})
    });
  };

  remove = () => {
    let choose = this.state.choose;
    if (choose.length === 0) this.props.showNotification(Type.WARNING, "Please input Rate Deck!");
    let rateNames = this.state.rateNames;
    let chooseRateNames = this.state.chooseRateNames;
    for (let j = 0; j < chooseRateNames.length; j++) {
      for (let i = 0; i< choose.length; i++) {
        const index = chooseRateNames.indexOf(choose[i]);
        if (index !== -1) {
          chooseRateNames.splice(index, 1);
          rateNames.push(choose[i]);
        }
      }
    }
    this.setState({
      rateNames: rateNames, chooseRateNames, all: [], choose: [],
      renameModal: produce(this.state.renameModal, m => {m.data = ""}),
      deleteModal: produce(this.state.deleteModal, m => {m.data = ""})
    });
  };

  rename = () => {
    if (this.state.renameModal.data.length === 0) {
      this.props.showNotification(Type.WARNING, "Please select Rate Deck!");
      return;
    } else if (this.state.renameModal.data.length > 1) {
      this.props.showNotification(Type.WARNING, "Please select 1 Rate Deck to rename!");
      return;
    }
    this.setState({
      renameModal: produce(this.state.renameModal, m => {
        m.isOpen = true;
      })
    });
    let originalData = this.state.originalData;
    for (let i = 0; i < originalData.length; i++) {
      if (originalData[i].name === this.state.renameModal.data[0]) {
        this.setState({selectedRate: originalData[i]})
      }
    }
  };

  delete = () => {
    if (this.state.deleteModal.data.length === 0) {
      this.props.showNotification(Type.WARNING, "Please select Rate Deck!");
      return;
    } else if (this.state.deleteModal.data.length > 1) {
      this.props.showNotification(Type.WARNING, "Please select 1 Rate Deck to delete!");
      return;
    }
    this.setState({
      deleteModal: produce(this.state.deleteModal, m => {
        m.isOpen = true;
      })
    });
    let originalData = this.state.originalData;
    for (let i = 0; i < originalData.length; i++) {
      if (originalData[i].name === this.state.deleteModal.data[0]) {
        this.setState({selectedRate: originalData[i]})
      }
    }
  };
  lcrReport = () => {
    if (this.state.chooseRateNames.length === 0) {
      this.props.showNotification(Type.WARNING, "Please choose carrier for LCR Report");
      return false;
    }
    if (this.state.reportName === "") {
      this.setState({isReportName: true});
      return false;
    }
    this.props.callApi(RestApi.generateLCR, response => {
    }, {rateNames: this.state.chooseRateNames, name: this.state.reportName});
  };
  viewList = (props, type) => {
    if (type === "lcr") {
      this.setState({isLcr: true})
      this.setState({
        modal: produce(this.state.modal, m => {
          m.isOpen = true; m.id = props.id;
          m.default_carrier = props.default_carrier; m.description = props.description;
          m.average_rate = props.average_rate;
        })
      })
    } else if (type === "lata1") {
      this.setState({
        modal1: produce(this.state.modal1, m => {
          m.isOpen = true;m.id = props.id;
          m.total_cost = props.total_cost; m.total_duration = props.total_duration;
          m.valid_npanxx_count = props.valid_npanxx_count;
          m.average_cost = props.average_cost; m.compared_cdr_file_names = props.compared_cdr_file_names;
          m.default_rate = props.default_rate; m.invalid_npanxx_count = props.invalid_npanxx_count;
          m.invalid_total_duration = props.invalid_total_duration; m.invalid_total_cost = props.invalid_total_cost;
          m.detail = this.getLata1Detail(props);
        })
      })
    } else if (type === "lata2") {
      this.setState({
        modal2: produce(this.state.modal2, m=> {
          m.isOpen = true; m.id = props.id; m.default_carrier = props.default_carrier;
          m.default_carrier_average_rate = props.default_carrier_average_rate;
          m.default_carrier_count = props.default_carrier_count; m.default_carrier_npa_nxx = props.default_carrier_npa_nxx;
          m.default_carrier_total_cost = props.default_carrier_total_cost;
          m.default_carrier_total_duration = props.default_carrier_total_duration;
          m.v1_average_cost = props.v1_average_cost; m.v1_total_cost = props.v1_total_cost;
          m.v1_total_duration = props.v1_total_duration; m.v2_average_cost = props.v2_average_cost;
          // m.v1_rated_count = props.v1_rated_count;
          m.v2_default_carrier_average_rate = props.v2_default_carrier_average_rate;
          m.v2_default_carrier_total_cost = props.v2_default_carrier_total_cost;
          m.v2_default_carrier_total_duration = props.v2_default_carrier_total_duration;
          m.v2_total_cost = props.v2_total_cost; m.v2_total_duration = props.v2_total_duration;
          m.v2_default_carrier = props.v2_default_carrier; m.v2_carriers_detail = props.v2_carriers_detail;
          m.v3_average_cost = props.v3_average_cost; m.v3_total_cost = props.v3_total_cost;
          m.v3_total_duration = props.v3_total_duration; m.v3_winning_carriers = props.v3_winning_carriers;
          m.v4_average_cost = props.v4_average_cost; m.v4_difference_average_cost = props.v4_difference_average_cost;
          m.v4_difference_total_cost = props.v4_difference_total_cost; m.detail = this.getDetail(props);
          m.v4_total_cost = props.v4_total_cost; m.v4_total_count = props.v4_total_count; m.v4_total_duration = props.v4_total_duration;
          m.token = this.props.auth.token;
        })
      });
    }
  };

  getLata1Detail = (props) => {
    console.log(props);
    let data = props.v3_carriers_detail;
    data = data.split("|");
    let res = [];
    for (let i = 0; i< data.length; i++) {
      let sub = data[i].split(":");
      res.push({
        carrier: sub[0],
        count: sub[1],
        duration: sub[2],
        cost: sub[3],
        average_cost: sub[4]
      })
    }
    res.push({
      carrier: "TOTAL",
      count: formatNumber(props.v3_total_count),
      duration: formatDuration(props.v3_total_duration),
      cost: formatCost(props.v3_total_cost),
      average_cost: formatAverageCost(props.v3_average_cost)
    });
    return res
  };

  getDetail = (props) => {
    let data = props.v4_other_carriers_detail;
    let detailData = [];
    if (data) {
      data = data.split("|");
    }
    if (data && data.length) {
      let def, unRated, invalid;
      for (let i = 0; i< data.length; i++) {
        let subdetail = data[i].split(':');
        if (subdetail[1] === props.default_carrier) {
          def = {
            category: "DEFAULT", count: formatNumber(subdetail[0]),
            carrier: subdetail[1], duration: subdetail[2],
            cost: subdetail[3], average_cost: subdetail[4]
          }
        } else if (subdetail[1] === "UNRATED") {
          unRated = {
            category: subdetail[1], count: formatNumber(subdetail[0]),
            carrier: "---", duration: subdetail[2],
            cost: subdetail[3], average_cost: subdetail[4]
          }
        } else if (subdetail[1] === "INVALID"){
          invalid = {
            category: subdetail[1], count: "-----",
            carrier: '---', duration: subdetail[2],
            cost: subdetail[3], average_cost: subdetail[4]
          }
        } else {
          detailData.push({
            category: "TOP 33K", count: formatNumber(subdetail[0]),
            carrier: subdetail[1], duration: subdetail[2],
            cost: subdetail[3], average_cost: subdetail[4]
          })
        }
      }
      if (def)detailData.unshift(def);
      if (unRated)detailData.push(unRated);
      if (invalid)detailData.push(invalid);
      detailData.push({
        category: "TOTAL", count: formatNumber(props.v4_total_count),
        carrier: "---", duration: formatDuration(props.v4_total_duration),
        cost: props.v4_total_cost, average_cost: props.v4_average_cost
      });
      // detailData.push({
      //   category: "DIFFERENCE", count: "-----", carrier: "---",
      //   duration: "-----", cost: props.v4_difference_total_cost,
      //   average_cost: props.v4_difference_average_cost
      // })
    }
    return detailData;
  };
  deleteList = (id, type) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    if (type === "lcr") {
      this.props.callApi(RestApi.deleteLCR, response => {if (response.ok)this.fetchLcrReport()}, id);
    } else if (type === "lata1") {
      this.props.callApi(RestApi.deleteLataNpanxxReport1ById, response => {if (response.ok) this.fetchLataNpanxx1()}, id);
    } else if (type === "lata2") {
      this.props.callApi(RestApi.deleteLataNpanxxReport2ById, response => {if (response.ok) this.fetchLataNpanxx2()}, id);
    }
  };
  lcrReportColumns = [
    {
      Header: 'Report name',
      accessor: 'name',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Compared Carriers',
      accessor: 'carriers',
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
      Cell: props => <div className="text-center">
        <Button size="sm" color="primary" onClick={() => this.viewList(props.original, "lcr")}>View</Button>
        <Button size="sm" color="danger" className="ml-2" onClick={() => this.deleteList(props.value, "lcr")}>Delete</Button>
        <Button size="sm" color="success" className="ml-2" onClick={() => {
          this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/lcr_report/" + props.value + "/download";
          this.textInput.value = this.props.auth.token;
          this.downloadForm.submit();
          this.textInput.value = "";
        }}>Download</Button>
      </div>
    },
  ];
  lataNpanxxReport1Columns = [
    {
      Header: 'Report name',
      accessor: 'name',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Compared Rate Deck Report',
      accessor: 'lcr_report_name',
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
      Cell: props => <div className="text-center">
        <Button size="sm" color="primary" onClick={() => this.viewList(props.original, "lata1")}>View</Button>
        <Button size="sm" color="danger" className="ml-2" onClick={() => this.deleteList(props.value, "lata1")}>Delete</Button>
        <Button size="sm" color="success" className="ml-2" onClick={() => {
          this.downloadForm.action = process.env.REACT_APP_API_ENDPOINT + "cprgen/lata_npanxx_report_1/" + props.value + "/download";
          this.textInput.value = this.props.auth.token;
          this.downloadForm.submit();
          this.textInput.value = "";
        }}>Download</Button>
      </div>
    },
  ];
  lataNpanxxReport2Columns = [
    {
      Header: 'Report name',
      accessor: 'name',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Selected CDR Report Name',
      accessor: 'report1_name',
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
      Cell: props => <div className="text-center">
        <Button size="sm" color="primary" onClick={() => this.viewList(props.original, "lata2")}>View</Button>
        <Button size="sm" color="danger" className="ml-2" onClick={() => this.deleteList(props.value, "lata2")}>Delete</Button>
      </div>
    },
  ];
  viewLcrReportColumns = [
    {
      Header: 'STATE',
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
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Min Rate',
      accessor: 'min_rate',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Min Carriers',
      accessor: 'carrier_1',
      sortable: false,
      Cell: props => {
        let carriers = [];
        for (let i = 1; i< 6; i++) {
          if (props.original['carrier_' + i] && props.original['carrier_' + i].length) {
            carriers.push(props.original['carrier_' + i])
          }
        }
        carriers = carriers.filter((v, i) => carriers.indexOf(v) === i);
        return <div className="text-center">{carriers.join(',')}</div>
      }
    },
  ];
  viewLataNpanxxReport2Columns = [
    {
      Header: 'STATE',
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
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Total Duration M/S',
      accessor: 'total_duration',
      filterable: true,
      Cell: props => <div className="text-right">{formatDuration(props.value)}</div>
    },
    {
      Header: 'Total Cost',
      accessor: 'total_cost',
      filterable: true,
      Cell: props => <div className="text-center">{formatCost(props.value)}</div>
    },
    {
      Header: 'Average Rate',
      accessor: 'average_rate',
      filterable: true,
      Cell: props => <div className="text-center">{formatAverageCost(props.value)}</div>
    },

  ];
  viewLataNpanxxReport3Columns = [
    {
      Header: 'STATE',
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
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Total Duration M/S',
      accessor: 'total_duration',
      filterable: true,
      Cell: props => <div className="text-right">{formatDuration(props.value)}</div>
    },
    {
      Header: 'Total Cost',
      accessor: 'total_cost',
      filterable: true,
      Cell: props => <div className="text-center">{formatCost(props.value)}</div>
    },
    {
      Header: 'Average Rate',
      accessor: 'average_rate',
      filterable: true,
      Cell: props => <div className="text-center">{formatAverageCost(props.value)}</div>
    },
    {
      Header: 'Carrier',
      accessor: 'min_carrier',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
  ];
  viewLataNpanxxReport4Columns = [
    {
      Header: 'STATE',
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
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Total Duration M/S',
      accessor: 'total_duration',
      filterable: true,
      Cell: props => <div className="text-right">{formatDuration(props.value)}</div>
    },
    {
      Header: 'Total Cost',
      accessor: 'total_cost',
      filterable: true,
      Cell: props => <div className="text-center">{formatCost(props.value)}</div>
    },
    {
      Header: 'Average Rate',
      accessor: 'average_rate',
      filterable: true,
      Cell: props => <div className="text-center">{formatAverageCost(props.value)}</div>
    },
    {
      Header: 'Winning Carrier',
      accessor: 'min_carrier',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    }
  ];
  viewLataNpanxxReport5Columns = [
    {
      Header: 'STATE',
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
      Header: 'NPANXX',
      accessor: 'npa_nxx',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Total Duration M/S',
      accessor: 'total_duration',
      filterable: true,
      Cell: props => <div className="text-right">{formatDuration(props.value)}</div>
    },
    {
      Header: 'Total Cost',
      accessor: 'total_cost',
      filterable: true,
      Cell: props => <div className="text-center">{formatCost(props.value)}</div>
    },
    {
      Header: 'Average Rate',
      accessor: 'average_rate',
      filterable: true,
      Cell: props => <div className="text-center">{formatAverageCost(props.value)}</div>
    },
    {
      Header: 'Carrier',
      accessor: 'min_carrier',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    }
  ];
  viewLataNpanxxReport1Columns = [
    {
      Header: 'STATE',
      accessor: 'state',
      filterable: true,
      width: 100,
      Cell: props => <div className="text-center">{props.value}</div>,
    },
    {
      Header: 'LATA',
      accessor: 'lata',
      Cell: props => <div className="text-center">{props.value}</div>,
      filterable: true,
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
      Header: 'Min Rate',
      accessor: 'min_rate',
      Cell: props => <div className="text-center">{formatAverageCost(props.value)}</div>
    },

  ];
  viewLataNpanxxReport1InvalidColumns = [
    {
      Header: 'STATE',
      accessor: 'state',
      filterable: true,
      width: 100,
      Cell: props => <div className="text-center">{props.value}</div>,
    },
    {
      Header: 'LATA',
      accessor: 'lata',
      Cell: props => <div className="text-center">{props.value}</div>,
      filterable: true,
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
    }
  ];
  fetchLcrReport = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(this._fetchLcrReport, 500)
  };
  _fetchLcrReport = () => {
    let sorts = [];
    let filters = [];
    if (this.state.sort.length) {
      let sorted = this.state.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.filter.length) {
      let filtered = this.state.filter;
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.page,
      pageSize: this.state.pageSize === 0 ? 10 : this.state.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLCR, response => {
      if (response.ok) {
        this.setState({data: response.data.rows, total_page: response.data.totalPages});
      }
    }, data);
  };

  fetchLataNpanxx1 = () => {
    this.fetchTime && clearTimeout(this.fetchTime);
    this.fetchTime = setTimeout(this._fetchLataNpanxx1, 600)
  };
  _fetchLataNpanxx1 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.lata.sort.length) {
      let sorted = this.state.lata.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.lata.filter.length) {
      let filtered = this.state.lata.filter;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.lata.page,
      pageSize: this.state.lata.pageSize === 0 ? 10 : this.state.lata.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport1, response => {
      if (response.ok) {
        this.setState({
          lata: produce(this.state.lata, m => {
            m.data = response.data.rows; m.total_page = response.data.totalPages
          })
        });
      }
    }, data);
  };

  fetchLataNpanxx2 = () => {
    this.fetchTime2 && clearTimeout(this.fetchTime2);
    this.fetchTime2 = setTimeout(this._fetchLataNpanxx2, 200)
  };
  _fetchLataNpanxx2 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.lata2.sort.length) {
      let sorted = this.state.lata2.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.lata2.filter.length) {
      let filtered = this.state.lata2.filter;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.lata2.page,
      pageSize: this.state.lata2.pageSize === 0 ? 10 : this.state.lata2.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport2, response => {
      if (response.ok) {
        this.setState({
          lata2: produce(this.state.lata2, m => {
            m.data = response.data.rows; m.total_page = response.data.totalPages
          })
        });
      }
    }, data);
  };

  viewData = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(this._viewData, 500);
  };
  _viewData = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal.sort.length) {
      let sorted = this.state.modal.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal.filter.length) {
      let filtered = this.state.modal.filter;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal.page,
      pageSize: this.state.modal.pageSize === 0 ? 10 : this.state.modal.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.viewLCR, response => {
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

  viewData1 = () => {
    this.fetchTime && clearTimeout(this.fetchTime);
    this.fetchTime = setTimeout(this._viewData1, 500)
  };
  _viewData1 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal1.sort.length) {
      let sorted = this.state.modal1.sort;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal1.filter.length) {
      let filtered = this.state.modal1.filter;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal1.page,
      pageSize: this.state.modal1.pageSize === 0 ? 10 : this.state.modal1.pageSize,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport1DataById, response => {
      console.log(response);
      if (response.ok) {
        this.setState({
          modal1: produce(this.state.modal1, m => {
            m.data = response.data.rows;
            m.total_page = response.data.totalPages
          })
        })
      }
    }, this.state.modal1.id, data);
  };

  viewData1Invalid = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(this._viewData1Invalid, 500)
  };
  _viewData1Invalid = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal1.sort2.length) {
      let sorted = this.state.modal1.sort2;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal1.filter2.length) {
      let filtered = this.state.modal1.filter2;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal1.page2,
      pageSize: this.state.modal1.pageSize2 === 0 ? 10 : this.state.modal1.pageSize2,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport1InvalidDataById, response => {
      console.log(response);
      if (response.ok) {
        this.setState({
          modal1: produce(this.state.modal1, m => {
            m.data2 = response.data.rows;
            m.total_page2 = response.data.totalPages
          })
        })
      }
    }, this.state.modal1.id, data);
  };

  viewData2 = () => {
    this.fetchTimer && clearTimeout(this.fetchTimer);
    this.fetchTimer = setTimeout(this._viewData2, 500)
  };
  _viewData2 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal2.sort2.length) {
      let sorted = this.state.modal2.sort2;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal2.filter2.length) {
      let filtered = this.state.modal2.filter2;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal2.page2,
      pageSize: this.state.modal2.pageSize2 === 0 ? 10 : this.state.modal2.pageSize2,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport2DataById, response => {
      if (response.ok) {
        this.setState({
          modal2: produce(this.state.modal2, m => {
            m.data2 = response.data.rows;
            m.total_page2 = response.data.totalPages
          })
        })
      }
    }, this.state.modal2.id, data);
  };

  viewData3 = () => {
    this.fetchTime && clearTimeout(this.fetchTime);
    this.fetchTime = setTimeout(this._viewData3, 500)
  };
  _viewData3 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal2.sort3.length) {
      let sorted = this.state.modal2.sort3;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal2.filter3.length) {
      let filtered = this.state.modal2.filter3;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal2.page3,
      pageSize: this.state.modal2.pageSize3 === 0 ? 10 : this.state.modal2.pageSize3,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport3DataById, response => {
      if (response.ok) {
        this.setState({
          modal2: produce(this.state.modal2, m => {
            m.data3 = response.data.rows;
            m.total_page3 = response.data.totalPages
          })
        })
      }
    }, this.state.modal2.id, data);
  };

  viewData4 = () => {
    this.fetchTimer4 && clearTimeout(this.fetchTimer4);
    this.fetchTimer4 = setTimeout(this._viewData4, 500)
  };
  _viewData4 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal2.sort4.length) {
      let sorted = this.state.modal2.sort4;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal2.filter4.length) {
      let filtered = this.state.modal2.filter4;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal2.page4,
      pageSize: this.state.modal2.pageSize4 === 0 ? 10 : this.state.modal2.pageSize4,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport4DataById, response => {
      if (response.ok) {
        this.setState({
          modal2: produce(this.state.modal2, m => {
            m.data4 = response.data.rows;
            m.total_page4 = response.data.totalPages
          })
        })
      }
    }, this.state.modal2.id, data);
  };

  viewData5 = () => {
    this.fetchTimer5 && clearTimeout(this.fetchTimer5);
    this.fetchTimer5 = setTimeout(this._viewData5, 500)
  };
  _viewData5 = () => {
    let sorts = [];
    let filters = [];
    if (this.state.modal2.sort5.length) {
      let sorted = this.state.modal2.sort5;
      let column = sorted[0][0].id;
      let direction = sorted[0][0].desc;
      if (direction === false) direction = "asc";
      else if (direction === true) direction = "desc";
      sorts.push({column, direction});
    }
    if (this.state.modal2.filter5.length) {
      let filtered = this.state.modal2.filter5;
      filtered = filtered[0];
      for (let i = 0; i < filtered.length; i++) {
        filters.push({column: filtered[i].id, contains: filtered[i].value});
      }
    }
    let data = {
      page: this.state.modal2.page5,
      pageSize: this.state.modal2.pageSize5 === 0 ? 10 : this.state.modal2.pageSize5,
      sorts: sorts,
      filters: filters
    };
    this.props.callApi(RestApi.searchLataNpanxxReport5DataById, response => {
      if (response.ok) {
        this.setState({
          modal2: produce(this.state.modal2, m => {
            m.data5 = response.data.rows;
            m.total_page5 = response.data.totalPages
          })
        })
      }
    }, this.state.modal2.id, data);
  };

  handleRefresh = () => {this.fetchLcrReport()};
  handleLataRefresh = () => this.fetchLataNpanxx1();
  handleLataRefresh2 = () => this.fetchLataNpanxx2();

  lataNpanxxReport1 = () => {
    if (this.state.lataNpanxxReportName1 === ""){this.setState({isLataReportName1: true}); return false}
    if (this.state.selectedLcr === ""){this.setState({isLcrReport: true}); return false}
    if (this.state.defaultRate === 0.0){this.setState({isDefaultRate: true}); return false}
    this.props.callApi(RestApi.generateLataNpanxxReport1, response => {}, {
      'name': this.state.lataNpanxxReportName1,
      'lcrReportId': this.state.selectedLcr,
      'defaultRate': this.state.defaultRate
    })
  };

  lataNpanxxReport2 = () => {
    if (this.state.lataNpanxxReportName2 === ""){this.setState({isLataReportName2: true}); return false}
    if (this.state.selectedLata1 === ""){this.setState({isLata1Report: true}); return false}
    this.props.callApi(RestApi.generateLataNpanxxReport2, response => {
    }, {
      'name': this.state.lataNpanxxReportName2,
      'lataNpanxxReport1Id': this.state.selectedLata1
    });
  };

  toggle = (tab) => {this.state.activeTab !== tab && this.setState({activeTab: tab});};

  render() {
    return (
      <Row>
        <Col lg="12">
          <Nav tabs className="custom">
            {this.renderNavbar("1", "Rate Deck Report")}
            {this.renderNavbar("2", "CDR Report")}
            {this.renderNavbar("3", "Routing Report")}
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Card>
                <CardHeader><strong style={{fontSize: 15}}>Rate Deck Report Generation</strong></CardHeader>
                <CardBody>
                  <FormGroup row>
                    <Col lg="8" className="row">
                      <Col lg="4">
                        <Label className="font-weight-bold">Rate Deck Report Name:</Label>
                      </Col>
                      <Col lg="6">
                        <Input type="text" onChange={(ev)=> {this.setState({reportName: ev.target.value, isReportName: false});
                        }} className="form-control-sm" invalid={this.state.isReportName}/>
                        {this.state.isReportName ? <FormFeedback>Please input report name!</FormFeedback> : ""}
                      </Col>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col lg="5">
                      <Card>
                        <CardHeader>All of Rate List</CardHeader>
                        <CardBody style={{height: 200}}>
                          <MultiSelectList items={this.state.rateNames} selectedItem={this.state.all} toggleSelection={(value) => {
                            let all = this.state.all;
                            if (all.findIndex(item => item === value) >= 0) {
                              all = all.filter(item => item !== value);
                            } else {
                              all.push(value);
                            }
                            this.setState({all, choose: []});
                            this.setState({renameModal: produce(this.state.renameModal, m => {m.data = all})});
                            this.setState({deleteModal: produce(this.state.deleteModal, m => {m.data = all})});
                          }} rowHeight={20}/>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col lg="2" className="text-center">
                      <Button size="sm" color="success" onClick={this.add} style={{width: '70%'}} className="mt-5">ADD &#62;&#62;</Button><br/>
                      <Button size="sm" color="success" onClick={this.remove} style={{width: '70%'}} className="mt-2">&#60;&#60; REMOVE</Button>
                      <Button size="sm" color="success" onClick={this.rename} style={{width: '70%'}} className="mt-2">RENAME</Button>
                      <Button size="sm" color="success" onClick={this.delete} style={{width: '70%'}} className="mt-2">DELETE</Button>
                    </Col>
                    <Col lg="5">
                      <Card>
                        <CardHeader>Choose Rate List</CardHeader>
                        <CardBody style={{height: 200}}>
                          <MultiSelectList items={this.state.chooseRateNames} selectedItem={this.state.choose} toggleSelection={(value) => {
                            let choose = this.state.choose;
                            if (choose.findIndex(item => item === value) >= 0) {
                              choose = choose.filter(item => item !== value);
                            } else {
                              choose.push(value);
                            }
                            this.setState({choose, all: []});
                            this.setState({renameModal: produce(this.state.renameModal, m => {m.data = choose})});
                            this.setState({deleteModal: produce(this.state.deleteModal, m => {m.data = choose})});
                          }} rowHeight={20}/>
                        </CardBody>
                      </Card>
                    </Col>
                  </FormGroup>
                  <Button size="md" color="primary" onClick={this.lcrReport}>Rate Deck Report Generation</Button>
                </CardBody>
              </Card>
              <div className="text-right">
                <Button size="md" color="link" onClick={this.handleRefresh}><i className="fa fa-refresh"/> Refresh</Button>
              </div>
              <ReactTable
                    manual
                    data={this.state.data}
                    columns={this.lcrReportColumns}
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
                    onPageChange={(page)=>this.setState({page})}
                    onPageSizeChange={(pageSize) => this.setState({pageSize: pageSize})}
                    minRows={this.state.data.length && this.state.data.length}
                    pages={this.state.total_page}
                    onFetchData={this.fetchLcrReport}
                  />
            </TabPane>
            <TabPane tabId="2">
              <Card>
                <CardHeader><strong style={{fontSize: 15}}>CDR Report Generation</strong></CardHeader>
                <CardBody>
                  <FormGroup row>
                    <Col lg="5" className="row">
                      <Col lg="6" className="text-right">
                        <Label className="font-weight-bold">CDR Report Name:</Label>
                      </Col>
                      <Col lg="6">
                        <Input type="text" onChange={(ev)=> {this.setState({lataNpanxxReportName1: ev.target.value, isLataReportName1: false});
                        }} className="form-control-sm" invalid={this.state.isLataReportName1}/>
                        {this.state.isLataReportName1 ? <FormFeedback>Please input CDR report name!</FormFeedback> : ""}
                      </Col>
                    </Col>
                    <Col lg="4" className="row">
                      <Col lg="8" className="text-right">
                        <Label className="font-weight-bold">Rate Deck Report List:</Label>
                      </Col>
                      <Col lg="4">
                        <Input type="select" onChange={(ev)=> {this.setState({selectedLcr: ev.target.value, isLcrList: false});
                        }} className="form-control-sm" invalid={this.state.isLcrList} required>
                          <option value=""/>
                          {this.state.lcrReportList.map(({id, name}) => {
                            return <option value={id}>{name}</option>
                          })}
                        </Input>
                        {this.state.isLcrList ? <FormFeedback>Please select Rate Deck report!</FormFeedback> : ""}
                      </Col>
                    </Col>
                    <Col lg="4" className="row">
                      <Col lg="6" className="text-right">
                        <Label className="font-weight-bold">Default Rate:</Label>
                      </Col>
                      <Col lg="6">
                        <Input type="number" onChange={(ev)=> {this.setState({defaultRate: parseFloat(ev.target.value), isDefaultRate: false});
                        }} className="form-control-sm" invalid={this.state.isDefaultRate}/>
                        {this.state.isDefaultRate ? <FormFeedback>Please input Default Rate!</FormFeedback> : ""}
                      </Col>
                    </Col>
                  </FormGroup>
                  <Button size="md" color="primary" onClick={this.lataNpanxxReport1}>CDR Report Generation</Button>
                </CardBody>
              </Card>
              <div className="text-right">
                <Button size="md" color="link" onClick={this.handleLataRefresh}><i className="fa fa-refresh"/> Refresh</Button>
              </div>
              <ReactTable
                manual
                data={this.state.lata.data}
                columns={this.lataNpanxxReport1Columns}
                defaultPageSize={10}
                onFilteredChange={(filter) => {
                  let filters = [];
                  filters.push(filter);
                  this.setState({
                    lata: produce(this.state.lata, m => {
                      m.filter = filters;
                    })
                  });
                }}
                onSortedChange={(sort) => {
                  let sorts = [];
                  sorts.push(sort);
                  this.setState({
                    lata: produce(this.state.lata, m => {
                      m.sort = sorts;
                    })
                  });
                }}
                onPageChange={(page) => {
                  this.setState({
                    lata: produce(this.state.lata, m => {
                      m.page = page;
                    })
                  });
                }}
                onPageSizeChange={(pageSize) => {
                  this.setState({
                    lata: produce(this.state.lata, m => {
                      m.pageSize = pageSize;
                    })
                  });
                }}
                minRows={this.state.lata.data.length && this.state.lata.data.length}
                pages={this.state.lata.total_page}
                onFetchData={this.fetchLataNpanxx1}
              />
            </TabPane>
            <TabPane tabId="3">
              <Card>
                <CardHeader><strong style={{fontSize: 15}}>Routing Report Generation</strong></CardHeader>
                <CardBody>
                  <FormGroup row>
                    <Col lg="5" className="row">
                      <Col lg="6" className="text-right">
                        <Label className="font-weight-bold">Routing Report Name:</Label>
                      </Col>
                      <Col lg="5">
                        <Input type="text" onChange={(ev)=> {this.setState({lataNpanxxReportName2: ev.target.value, isLataReportName2: false});
                        }} className="form-control-sm" invalid={this.state.isLataReportName2}/>
                        {this.state.isLataReportName2 ? <FormFeedback>Please input Routing Report name!</FormFeedback> : ""}
                      </Col>
                    </Col>
                    <Col lg="4" className="row">
                      <Col lg="6" className="text-right">
                        <Label className="font-weight-bold">CDR Report List:</Label>
                      </Col>
                      <Col lg="6">
                        <Input type="select" onChange={(ev)=> {this.setState({selectedLata1: ev.target.value, isLata1Report: false});
                        }} className="form-control-sm" invalid={this.state.isLata1Report} required>
                          <option value=""/>
                          {this.state.lata1List.map(({id, name}) => {
                            return <option value={id}>{name}</option>
                          })}
                        </Input>
                        {this.state.isLata1Report ? <FormFeedback>Please select CDR Report!</FormFeedback> : ""}
                      </Col>
                    </Col>
                  </FormGroup>
                  <Button size="md" color="primary" onClick={this.lataNpanxxReport2} className="ml-3">Routing Report Generation</Button>
                </CardBody>
              </Card>
              <div className="text-right">
                <Button size="md" color="link" onClick={this.handleLataRefresh2}><i className="fa fa-refresh"/> Refresh</Button>
              </div>
              <ReactTable
                manual
                data={this.state.lata2.data}
                columns={this.lataNpanxxReport2Columns}
                defaultPageSize={10}
                onFilteredChange={(filter) => {
                  let filters = [];
                  filters.push(filter);
                  this.setState({
                    lata2: produce(this.state.lata2, m => {
                      m.filter = filters;
                    })
                  });
                }}
                onSortedChange={(sort) => {
                  let sorts = [];
                  sorts.push(sort);
                  this.setState({
                    lata2: produce(this.state.lata2, m => {
                      m.sort = sorts;
                    })
                  });
                }}
                onPageChange={(page) => {
                  this.setState({
                    lata2: produce(this.state.lata2, m => {
                      m.page = page;
                    })
                  });
                }}
                onPageSizeChange={(pageSize) => {
                  this.setState({
                    lata2: produce(this.state.lata2, m => {
                      m.pageSize = pageSize;
                    })
                  });
                }}
                minRows={this.state.lata2.data.length && this.state.lata2.data.length}
                pages={this.state.lata2.total_page}
                onFetchData={this.fetchLataNpanxx2}
              />
            </TabPane>
          </TabContent>
        </Col>
        <ViewLCRModal
          isOpen={this.state.modal.isOpen}
          toggle={this.toggleModal}
          columns={this.viewLcrReportColumns}
          data={this.state.modal.data}
          fetchData={this.viewData}
          total_page={this.state.modal.total_page }
          title={"View LCR Report"}
          handler={this.handleUpdate}
          isLcr={this.state.isLcr}
          default_carrier={this.state.modal.default_carrier}
          description={this.state.modal.description}
          average_rate={this.state.modal.average_rate}
        />
        <ViewLata1Modal
          isOpen={this.state.modal1.isOpen}
          toggle={this.toggleModal1}
          columns={this.viewLataNpanxxReport1Columns}
          columns2={this.viewLataNpanxxReport1InvalidColumns}
          data={this.state.modal1.data}
          data2={this.state.modal1.data2}
          fetchData={this.viewData1}
          fetchData2={this.viewData1Invalid}
          total_page={this.state.modal1.total_page}
          total_page2={this.state.modal1.total_page2}
          handler={this.handleLataUpdate1}
          isLata1={true}
          title="View CDR Report"
          total_duration={this.state.modal1.total_duration}
          total_cost={this.state.modal1.total_cost}
          average_cost={this.state.modal1.average_cost}
          compared_cdr_file_names={this.state.modal1.compared_cdr_file_names}
          default_rate={this.state.modal1.default_rate}
          invalid_npanxx_count={this.state.modal1.invalid_npanxx_count}
          invalid_total_cost={this.state.modal1.invalid_total_cost}
          invalid_total_duration={this.state.modal1.invalid_total_duration}
          valid_npanxx_count={this.state.modal1.valid_npanxx_count}
          detail={this.state.modal1.detail}
        />
        <ViewLata2Modal
          isOpen={this.state.modal2.isOpen}
          toggle={this.toggleModal2}
          column2={this.viewLataNpanxxReport2Columns}
          column3={this.viewLataNpanxxReport3Columns}
          column4={this.viewLataNpanxxReport4Columns}
          column5={this.viewLataNpanxxReport5Columns}
          data={this.state.modal2}
          fetchData2={this.viewData2}
          fetchData3={this.viewData3}
          fetchData4={this.viewData4}
          fetchData5={this.viewData5}
          handler={this.handleLataUpdate2}
        />
        <RenameRateModal
          isOpen={this.state.renameModal.isOpen}
          data={this.state.renameModal.data}
          toggle={this.toggleRenameModal}
          handler={this.handleRename}
          rename={this.updateRename}
        />
        <DeleteRateModal
          isOpen={this.state.deleteModal.isOpen}
          data={this.state.deleteModal.data}
          toggle={this.toggleDeleteModal}
          handler={this.handleDelete}
          delete={this.updateDelete}
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

  updateRename = () => {
    if (this.state.renameModal.data === this.state.selectedRate.name) {
      this.props.showNotification(Type.WARNING, "Rate Deck name was not changed!");
      return false;
    }
    let data = new FormData();
    data.append("newName", this.state.renameModal.data);
    this.props.callApi(RestApi.renameRateDeck, response => {
      if (response.ok) {
        this.setState({
          renameModal: produce(this.state.renameModal, m => {
            m.isOpen = false;
          })
        });
        this.setState({
          rateNames:this.state.rateNames.map((rate) => {
            if (rate === this.state.selectedRate.name) return this.state.renameModal.data;
            else return rate;
          }),
          chooseRateNames: this.state.chooseRateNames.map((rate) => {
            if (rate === this.state.selectedRate.name) return this.state.renameModal.data;
            else return rate;
          })
        });
      }
    }, this.state.selectedRate.id, data)
  };

  updateDelete = () => {
    this.props.callApi(RestApi.deleteRateDeck, response => {
      if (response.ok) {
        this.setState({deleteModal: produce(this.state.deleteModal, m => {m.isOpen = false;})});
        this.setState({
          rateNames:this.state.rateNames.filter((item) => {
            return item !== this.state.selectedRate.name
          }),
          chooseRateNames:this.state.chooseRateNames.filter((item) => {
            return item !== this.state.selectedRate.name
          }),
        });
        this.setState({...this.state, all:[], deleteModal: {...this.state.deleteModal, isOpen: false, data: []}})
        // window.location.reload();
      }
    }, this.state.selectedRate.id)
  };

  toggleModal = () => {
    const modal = produce(this.state.modal, m => {
      m.isOpen = !m.isOpen; m.filter = []; m.sort = []; m.page = 0; m.pageSize = 0; m.total_page = 0;
    });
    this.setState({modal});
  };

  toggleModal1 = () => {
    const modal = produce(this.state.modal1, m => {
      m.isOpen = !m.isOpen;m.filter = []; m.sort = []; m.page = 0; m.pageSize = 0; m.total_page = 0;
    });
    this.setState({modal1: modal});

  };
  toggleModal2 = () => {
    const modal = produce(this.state.modal2, m => {
      m.isOpen = !m.isOpen;m.filter2 = []; m.sort2 = []; m.page2 = 0; m.pageSize2 = 0; m.total_page2 = 0;
      m.filter3 = []; m.sort3 = []; m.page3 = 0; m.pageSize3 = 0; m.total_page3 = 0;
      m.filter4 = []; m.sort4 = []; m.page4 = 0; m.pageSize4 = 0; m.total_page4 = 0;
    });
    this.setState({modal2: modal});
  };

  toggleRenameModal = () => {
    const renameModal = produce(this.state.renameModal, m => {
      m.isOpen = !m.isOpen;
    });
    this.setState({renameModal});
  };

  toggleDeleteModal = () => {
    const deleteModal = produce(this.state.deleteModal, m => {
      m.isOpen = !m.isOpen;
    });
    this.setState({deleteModal});
  };

  handleUpdate = (type, value) => {
    this.setState({
      modal: produce(this.state.modal, m => {
        m[type] = value
      })
    })
  };
  handleLataUpdate2 = (type, value) => {
    this.setState({
      modal2: produce(this.state.modal2, m => {
        m[type] = value
      })
    })
  };

  handleLataUpdate1 = (type, value) => {
    this.setState({
      modal1: produce(this.state.modal1, m => {
        m[type] = value
      })
    })
  };

  handleRename = (value) => {
    this.setState({
      renameModal: produce(this.state.renameModal, m => {
        m.data = value
      })
    });

  };

  handleDelete = (value) => {
    this.setState({
      deleteModal: produce(this.state.deleteModal, m => {
        m.data = value
      })
    })
  }
}
export default withAuthApiLoadingNotification(LCRReport);
