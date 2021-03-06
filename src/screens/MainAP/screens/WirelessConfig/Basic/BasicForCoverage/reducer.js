import { fromJS } from 'immutable';


const defaultState = fromJS({
  currRadioConfig: {
    radioId: '0',
    radioType: '2.4G',
  },
  scaning: true,
  showScanResult: false,
  showRadioSetting: true,
  showSsidSetting: true,
  showSpeedLimitModal: false,
  showMultiSsid: false,
  ssidTableOptions: [],
  selectedResult: {},
  showCtyModal: false,
  agreeProtocol: false,
  selectedCountry: '',
  channels: [],
  maxTxpower: '27',
  minTxpower: '3',
  security: {
    mode: 'wpa',
    cipher: 'aes',
    key: '12345678',
  },
  tableItemForSsid: {
    isShow: '0',
    val: '',
    item: {},
    pos: '',
  },
  whichButton: '',
  radioSettings: {},
  multiSsid: {},
  basicSettings: {},
  airTimeEnable: '0',
  transferData: '',
  showMacHelpInfo: false,
  apMacInputData: '',
});

function onUpdateSelfItemSettings(state, action) {
  const curModule = action.data.curModule;
  const data = action.data.data;
  return state.mergeIn([curModule], data);
}


export default function (state = defaultState, action) {
  switch (action.type) {
    case 'CHANGE_SCAN_STATUS':
      return state.set('scaning', action.data);
    case 'CHANGE_SHOW_SCAN_RESULT_STATUS':
      return state.set('showScanResult', action.data);
    case 'CHANGE_SELECTED_RESULT':
      return state.set('selectedResult', action.data);
    case 'CHANGE_CTY_MODAL':
      return state.set('showCtyModal', action.data);
    case 'CHANGE_AGREE_PROTOCOL':
      return state.set('agreeProtocol', action.data);
    case 'CHANGE_COUNTRY_CODE':
      return state.set('selectedCountry', action.data);
    case 'CLOSE_COUNTRY_SELECT_MODAL':
      return state.set('showCtyModal', false).set('agreeProtocol', false)
        .set('selectedCountry', action.data);
    case 'RECEIVE_COUNTRY_INFO':
      return state.set('channels', fromJS(action.data.channels))
        .set('maxTxpower', action.data.maxTxpower)
        .set('minTxpower', action.data.minTxpower);
    case 'LEAVE_SCREEN':
      return defaultState;
    case 'RESTORE_SELF_STATE':
      return defaultState;

    case 'CHANGE_TITLE_SHOW_ICON':
      return state.set(action.data.name, action.data.value);
    case 'CHANGE_TABLE_ITEM_FOR_SSID':
      return state.set('tableItemForSsid', action.data);
    case 'UPDATE_SELF_ITEM_SETTINGS':
      return onUpdateSelfItemSettings(state, action);
    case 'UPDATE_RADIO_SETTINGS_ITEM':
      return state.mergeIn(['radioSettings'], action.data);
    case 'UPDATE_MULTI_SSID_ITEM':
      return state.mergeIn(['multiSsid'], action.data);
    case 'UPDATE_BASIC_SETTINGS':
      return state.mergeIn(['basicSettings'], action.data);
    case 'CHANGE_WHICH_BUTTON':
      return state.set('whichButton', action.data);
    case 'CHANGE_SSID_TABLE_OPTIONS':
      return state.set('ssidTableOptions', action.data);
    case 'CHANGE_CURR_RADIO_CONFIG':
      return state.set('currRadioConfig', action.data);
    case 'CHANGE_AIR_TIME_ENABLE':
      return state.set('airTimeEnable', action.data);
    case 'CHANGE_SHOW_SPEED_LIMIT_MODAL':
      return state.set('showSpeedLimitModal', action.data);
    case 'CHANGE_TRANSFER_DATA':
      return state.set('transferData', action.data);
    case 'CHANGE_SHOW_MAC_HELP_INFO':
      return state.set('showMacHelpInfo', action.data);
    case 'CHANGE_AP_MAC_INPUT':
      return state.set('apMacInputData', action.data);
    default:
  }
  return state;
}

