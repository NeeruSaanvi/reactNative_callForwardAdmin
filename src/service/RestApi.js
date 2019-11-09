import apisauce from 'apisauce';

const _instance = (baseURL) => {
  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //
  return apisauce.create({
    // base URL is read from the "constructor"
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    // 100 second timeout...
    timeout: 100000
  });
};

const instance = _instance.bind(null, process.env.REACT_APP_API_ENDPOINT);
const somosInstance = _instance.bind(null, process.env.REACT_APP_API_ENDPOINT_SOMOS);

// Define api functions.

//login
const login = (api, username, password) => api.post('/session/login', {username, password});
const refreshToken = (api, token) => api.post('/session/refresh', {refreshToken: token});
//Account
const getVersions = (api) => api.get('/versions');
const getNotifications = (api) => api.get('/notifications');
//Profile
const getProfile = (api) => api.get('/profile');
const updateProfileAdditional = (api, req) => api.put('/profile/additional', req);
const updateProfileIps = (api, ips) => api.put('/profile/ips', ips);
const updateProfileMain = (api, req) => api.put('/profile/main', req);
const updatePassword = (api, req) => api.put('/profile/password', req);
//Role
const getRoles = (api) => api.get('/roles');
const getRoleDetails = (api, id) => api.get('/roles/'+ id);
const createRole = (api, req) =>  api.post('/roles', req);
const updateRole = (api, req) => api.put('/roles/' + req.id, req.req);
const deleteRole = (api, id) => api.delete('/roles/' + id);
//Users
const createUser = (api, req) => api.post('/users', req);
const activateUser = (api, id) => api.put('/users/'+id+'/activate');
const deactivateUser = (api, id) => api.put('/users/'+id+'/deactivate');
const deleteUserByID = (api, id) => api.delete('/users/' + id);
const getUserDetailByID = (api, id) => api.get('/users/' + id);
const getUsers = (api, req) => api.post('/users/search', req);
const updateUserAdditionalInformation = (api, id, req) => api.put('/users/' + id + '/additional', req);
const updateUserIpInformation = (api, id, req) => api.put('/users/' + id + '/ips', req);
const updateUserMainInformation = (api, id, req) => api.put('/users/' + id + '/main', req);
const updateUserPassword = (api, id, req) => api.put('/users/' + id + '/password', req);
//MGI Id and Ro
const deleteIdRo = (api, id) => api.delete('/mgi/users/' + id + '/idro');
const getAllIdRo = (api, req) => api.post('/mgi/users/idro', req);
const getUserIdRo = (api, id) => api.get('/mgi/users/' + id + '/idro');
const updateUserIdRo = (api, req) => api.post('/mgi/users/' + req.id + '/idro', req.req);
//MGI somos connections
const getSomosConnections = (api) => api.get('/mgi/connections');
const activateSMSConnection = (api, id) => api.put('/mgi/connections/' + id + '/activate');
const deactivateSMSConnection = (api, id) => api.put('/mgi/connections/' + id + '/deactivate');
const checkMGIConnectionStatus = (api) => api.get('/mgi/connections/status');
const createSMSConnection = (api, req) => api.post('/mgi/connections', req);
const deleteSMSConnection = (api, id) => api.delete('/mgi/connections/' + id);
const restartSMSConnections = (api) => api.get('/mgi/connections/restart');
const startSMSConncetions = (api) => api.get('/mgi/connections/start');
const stopSMSConncetions = (api) => api.get('/mgi/connections/stop');
const updateSMSConnection = (api, id, req) => api.put('/mgi/connections/' + id, req);
// CPRGen
const uploadLerg = (api, form) => {return api.post('/cprgen/lerg/upload', form, {headers:{'Content-Type': 'multipart/form-data'}, timeout: 3600000});};
const insertLerg = (api, req) => api.post('/cprgen/lerg/insert', req);
const searchLerg = (api, req) => api.post('/cprgen/lerg/search', req);
const uploadRate = (api, form) => {
  return api.post('/cprgen/rate/upload', form, {headers:{'Content-Type': 'multipart/form-data'}, timeout: 3600000});
};
const insertRate = (api, req) => api.post('/cprgen/rate/insert', req);
const searchRate = (api, req) => api.post('/cprgen/rate/search', req);
const uploadCDR = (api, form) => {
  return api.post('/cprgen/cdr/upload', form, {headers:{'Content-Type': 'multipart/form-data'}, timeout: 3600000});
};
const getRateDeckList = (api) => api.get("/cprgen/rate/list");
const renameRateDeck = (api, id, form) => api.put("/cprgen/rate/list/rename/" + id, form);
const deleteRateDeck = (api, id) => api.delete("/cprgen/rate/list/delete/" + id, {timeout: 3600000});
const insertCDR = (api, req) => api.post('/cprgen/cdr/insert', req);
const searchCDR = (api, req) => api.post('/cprgen/cdr/search', req);
const dipCDR = (api, req) => api.post('/cprgen/cdr/dip', req);
const getInfo = (api) => api.get('/cprgen/cdr/info');
const deleteCdrs = (api) => api.delete('/cprgen/cdr/deleteAll');

const generateLCR = (api, req) => api.post('/cprgen/lcr_report', req);
const searchLCR = (api, req) => api.post('/cprgen/lcr_report/search', req);
const viewLCR = (api, id, req) => api.post('/cprgen/lcr_report/' + id, req);
const deleteLCR =  (api, id) => api.delete('/cprgen/lcr_report/' + id);
const getLCRReportList =  (api) => api.get('/cprgen/lcr_report/list');

const createCPRReport = (api, req) => api.post('/cprgen/cpr_report', req);
const createNewCPRReport = (api, req) => api.post('/cprgen/new_cpr_report', req);
const searchNewCPRReport = (api, req) => api.post('/cprgen/new_cpr_report/search', req);
const searchNewCPRReportData1 = (api, id, req) => api.post('/cprgen/new_cpr_report/view1/' + id + '/searchData', req);
const downloadNewCPRReportData1 = (api, id, req) => api.post('/cprgen/new_cpr_report/view1/' + id + '/download', req);
const deleteNewCPRReport = (api, id) => api.delete('/cprgen/new_cpr_report/' + id);
const getCPRReports = (api, req) => api.post('/cprgen/cpr_report/list', req);
const getCprReportDataById = (api, id, req) => api.post('/cprgen/cpr_report/' + id, req);
const deleteCprReportById = (api, id) => api.delete('/cprgen/cpr_report/' + id);
const getCprReportSummary = (api, id) => api.get('/cprgen/cpr_report/' + id + '/summary');
const buildLAD = (api, req) => api.post('/cprgen/lad', req);
const searchLAD = (api, req) => api.post('/cprgen/lad/search', req);
const getLATA = (api, id) => api.get('/cprgen/lad/' + id + '/lata');
const get6Digit = (api, id) => api.get('/cprgen/lad/' + id + '/sd');

const getLata1List = (api) => api.get('/cprgen/lata_npanxx_report_1/list');
const getLataList2 = (api) => api.get('/cprgen/lata_npanxx_report_2/list');
const generateLataNpanxxReport1 = (api, req) => api.post('/cprgen/lata_npanxx_report_1', req);
const generateLataNpanxxReport2 = (api, req) => api.post('/cprgen/lata_npanxx_report_2', req);
const searchLataNpanxxReport1 = (api, req) => api.post('/cprgen/lata_npanxx_report_1/search', req);
const searchLataNpanxxReport2 = (api, req) => api.post('/cprgen/lata_npanxx_report_2/search', req);
const searchLataNpanxxReport1DataById = (api, id, req) => api.post('/cprgen/lata_npanxx_report_1/' + id, req);
const searchLataNpanxxReport1InvalidDataById = (api, id, req) => api.post('/cprgen/lata_npanxx_report_1/' + id + '/invalid', req);
const searchLataNpanxxReport2DataById = (api, id, req) => api.post('/cprgen/lata_npanxx_report_2/view1/' + id, req);
const searchLataNpanxxReport3DataById = (api, id, req) => api.post('/cprgen/lata_npanxx_report_2/view2/' + id, req);
const searchLataNpanxxReport4DataById = (api, id, req) => api.post('/cprgen/lata_npanxx_report_2/view3/' + id, req);
const searchLataNpanxxReport5DataById = (api, id, req) => api.post('/cprgen/lata_npanxx_report_2/view4/' + id, req);
const deleteLataNpanxxReport1ById = (api, id) => api.delete('/cprgen/lata_npanxx_report_1/' + id);
const deleteLataNpanxxReport2ById = (api, id) => api.delete('/cprgen/lata_npanxx_report_2/' + id);


const activityLog = (api, req) => api.post('/tools/activity_log', req);
const getSomosMessageById = (api, id) => api.get('/tools/activity_log/' + id);


// Somos Api calls
const getRunningSomosConnections = api => api.get('/connections');
const restartSomosConnectionsNew = api => api.get('/connections/restart');
const stopSomosConnectionsNew = api => api.get('/connections/stop');

// Company Api calls
const addCompany = (api, req) => api.post('/company', req);
const updateCompany = (api, req) => api.put('/company/update', req);
const deleteCompany = (api, id) => api.get('/company/delete/' + id);
const findByCompanyId = (api, id) => api.get('/company/' + id);
const activateCompany = (api, id) =>  api.get('/company/activate/' + id);
const deactivateCompany = (api, id) =>  api.get('/company/deactivate/' + id);
const listAllCompany = api => api.get('/company/list');
const searchAllCompany = (api, req) => api.post('/company/search', req);
const resetPassword = (api, req) => api.put('/user/reset-password', req);

export default{instance, somosInstance, login, refreshToken, getVersions, getNotifications, getProfile, updateProfileAdditional, updateProfileIps, updateProfileMain, updatePassword, getRoles,
  getRoleDetails, updateRole, deleteRole, createRole, createUser, activateUser, deactivateUser, deleteUserByID, getUserDetailByID, getUsers, updateUserAdditionalInformation,
  updateUserIpInformation, deleteIdRo, getAllIdRo, getUserIdRo, updateUserIdRo, getSomosConnections, activateSMSConnection, deactivateSMSConnection, checkMGIConnectionStatus,
  createSMSConnection, deleteSMSConnection, restartSMSConnections, startSMSConncetions, stopSMSConncetions, updateSMSConnection, uploadLerg, insertLerg, searchLerg, activityLog,
  getSomosMessageById, updateUserMainInformation, updateUserPassword,uploadCDR, insertCDR, searchCDR, uploadRate, insertRate, searchRate, getRateDeckList, generateLCR, searchLCR, viewLCR, deleteLCR,
  deleteRateDeck, renameRateDeck, getLCRReportList, createCPRReport, getCprReportDataById, getCPRReports, getCprReportSummary, generateLataNpanxxReport1, searchLataNpanxxReport1,
  generateLataNpanxxReport2, searchLataNpanxxReport2, searchLataNpanxxReport2DataById, deleteLataNpanxxReport2ById, dipCDR, searchLataNpanxxReport1DataById, deleteLataNpanxxReport1ById,
  getInfo, deleteCdrs, getLata1List, searchLataNpanxxReport3DataById, searchLataNpanxxReport4DataById, searchLataNpanxxReport5DataById, searchLataNpanxxReport1InvalidDataById,
  getLataList2, buildLAD, searchLAD, getLATA, get6Digit, createNewCPRReport, searchNewCPRReport, searchNewCPRReportData1, downloadNewCPRReportData1, deleteNewCPRReport,
  getRunningSomosConnections, restartSomosConnectionsNew, stopSomosConnectionsNew, deleteCprReportById,
  addCompany, updateCompany, deleteCompany, findByCompanyId, activateCompany, deactivateCompany, 
  listAllCompany, resetPassword, searchAllCompany
}

