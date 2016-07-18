import {Map, List, fromJS} from 'immutable';

let guiVersion = '.' + GUI_CONFIG.version.replace(/\./g, '');

function getControlStatus() {
  var ret = false;
  var a_165F8BA5ABE1A5DA = '0';

  if(sessionStorage && sessionStorage.getItem('a_165F8BA5ABE1A5DA') !== null) {
    a_165F8BA5ABE1A5DA = sessionStorage.getItem('a_165F8BA5ABE1A5DA');
  }

  ret = typeof a_165F8BA5ABE1A5DA === 'string' && a_165F8BA5ABE1A5DA === '0';

  return ret;
};

function clearLoginSession() {
  if(typeof sessionStorage.removeItem === 'function') {
    sessionStorage.removeItem('a_165F8BA5ABE1A5DA')
  }
}

const defaultState = fromJS({
  saving: false,
  rateInterval: 15000,
  invalid: {},
  modal: {
    role: 'alert',
  },
  propertyData: {
    show: false,
    items: []
  },
  noControl: false
});

function receiveReport(state, data) {
  var ret;

  if(!data.checkResult) {
    ret = state.deleteIn(['invalid', data.name]);
  } else {
    ret = state.setIn(['invalid', data.name], data.checkResult);
  }

  return ret;
}

export default function( state = defaultState, action ) {

  switch (action.type) {
    case 'START_VALIDATE_ALL':
      return state.set('validateAt', action.validateAt)
          .set('invalid', Map({}));

    case 'RESET_VAILDATE_MSG':
      return state.set('invalid', Map({}));

    /**
     * Ajax
     */
    case 'REQUEST_SAVE':
      return state.set('saving', true);

    case 'RECEIVE_SAVE':
      return state.set('saving', false)
        .set('savedAt', action.savedAt)
        .set('state', action.state);

    case 'RECEIVE_AJAX_ERROR':
      return state.set('ajaxError', {
        url: action.url
      });

    case 'RECEIVE_SERVER_ERROR':
      return state.set('state', action.state)

    case 'REPORT_VALID_ERROR':
      return receiveReport(state, action.data);

    case "CHANGE_LOGIN_STATUS":
      sessionStorage.setItem('a_165F8BA5ABE1A5DA', action.data);
      return state;

    case 'REFRESH_ALL':
      return state.set('refreshAt', action.refreshAt);

    case 'REQUEST_FETCH_AC_INFO':
      return state.set('fetching', true);

    case 'RECIVECE_FETCH_AC_INFO':
      action.data.version += guiVersion;
      return state.set('fetching', false).merge(action.data);

    case 'CREATE_MODAL':
      return state.set('modal', Map({
          status: 'show',
          role: 'alert',
          title: _('MESSAGE'),
        })).mergeIn(['modal'], action.data);

    case 'CHANGE_MODAL_STATE':
      return state.mergeIn(['modal'], action.data);


    case 'changePropertyStatus':
      return state.setIn();

    case 'changePropertyStatus':
      return state;

    default:
  }
  return state;
};
