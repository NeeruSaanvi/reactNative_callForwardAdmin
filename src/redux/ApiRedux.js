import {combineActions, createAction, handleAction} from 'redux-actions'
import Actions from '../constants/ReduxActionTypes'

// Example of calling api
/**
 let callAction = action(API.createRole, req, (result) => {
    // Process result here
  });
 this.props.dispatch(callAction);

 // API is needed as first parameter to set correct authentication token.
 **/

const callApi = createAction(
  Actions.CALL_API,
  (method, callback, ...args) => ({method, callback, args})
);

const callApiSomos = createAction(
  Actions.CALL_API_SOMOS,
  (method, callback, ...args) => ({method, callback, args})
);

const reducer = handleAction(combineActions(callApi, callApiSomos), undefined, {});

export {
  callApi,
  callApiSomos,
  reducer,
}


