import Immutable, {Map, List, fromJS} from 'immutable';
import channels from './channels.json';

const channelsList = List(channels);
const defaultSettings = Map({
  encryption: 'none',
  vlanenable: '0',
  upstream: '0',
  downstream: '0',
  country: getCountry(),
  channel: '6',
  channelsBandwidth: '20',
  ssid: '',
  vlanid: '',
});

const defaultState = fromJS({
  data: {
    list: [],
    curr: {}
  }
});

function getCountry(country) {
  var initLang = country;
  var ret = '';
  var navigator = window.navigator;

  if (!initLang) {
    initLang = (navigator.language || navigator.userLanguage ||
      navigator.browserLanguage || navigator.systemLanguage ||
      'CN').substr(-2).toUpperCase();
  }

  channelsList.find(function (item) {
    if (item.country === initLang) {
      ret = item.country;
    }
  });

  return ret || 'CN';
}

function transformCountryData(settingData) {
  var ret;

  ret = settingData.set('country', getCountry(settingData.get('country')));

  channelsList.forEach(function (item) {

    if (item.country === ret.get('country')) {
      if (parseInt(ret.get('channel'), 10) > parseInt(item['2.4g'].substr(-2), 10)) {
        ret = ret.set('channel', '0');
      }
    }
  });

  return ret;
}

function receiveSettings(state, settingData) {
  let ret = state.update('data', data => data.merge(settingData));
  const currData = state.getIn(['data', 'curr']) || Map({});
  let listCurr;

  if (!currData.isEmpty()) {
    listCurr = currData.merge(defaultSettings).merge(ret.getIn(['data', 'list']).find(function (item) {
      return currData.get('groupname') === item.get('groupname');
    }))

  } else {
    listCurr = currData.merge(defaultSettings).merge(ret.getIn(['data', 'list', 0]))
  }

  listCurr = transformCountryData(listCurr);

  return ret.setIn(['data', 'curr'], listCurr)
    .set('fetching', false);
}

function changeGroup(state, groupname) {
  let ret = state.mergeIn(['data', 'curr'], defaultSettings);
  let selectGroup = state.getIn(['data', 'list'])
    .find(function (item) {
      return item.get('groupname') === groupname;
    })

  selectGroup = transformCountryData(selectGroup);

  return ret.mergeIn(['data', 'curr'], selectGroup);
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case 'REQEUST_FETCH_WIFI':
      return state.set('fetching', true);

    case 'RECEIVE_WIFI':
      return receiveSettings(state, action.data);

    case "CHANGE_WIFI_GROUP":
      return changeGroup(state, action.name);

    case "CHANGE_WIFI_SETTINGS":
      return state.mergeIn(['data', 'curr'], action.data)

    default:

  }
  return state;
};
