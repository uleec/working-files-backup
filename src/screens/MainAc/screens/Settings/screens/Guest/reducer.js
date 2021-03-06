import Immutable, {Map, List, fromJS} from 'immutable';

const defaultSettings = Map({
  enable: '0',
  encryption: 'none',
  vlanenable: '0',
  upstream: '0',
  downstream: '0',
  portalenable: '0',
  guestssid: '',
});

const defaultState = fromJS({
  data: {
    list: [],
    curr: {},
  },
});

function receiveSettings(state, settingData) {
  let ret = state.update('data', data => data.merge(settingData));
  const currData = state.getIn(['data', 'curr']) || Map({});
  let listCurr;

  if (!currData.isEmpty()) {
    listCurr = currData.merge(ret.getIn(['data', 'list']).find(item => currData.get('groupname') === item.get('groupname')));
  } else {
    listCurr = currData.merge(ret.getIn(['data', 'list', 0]));
  }
  return ret.setIn(['data', 'curr'], listCurr)
    .set('fetching', false);
}

function changeGroup(state, groupname) {
  const ret = state.mergeIn(['data', 'curr', 'radio2.4G'], defaultSettings).mergeIn(['data', 'curr', 'radio5.8G'], defaultSettings);
  const selectGroup = state.getIn(['data', 'list'])
    .find(item => item.get('groupname') === groupname);
  return ret.mergeIn(['data', 'curr'], selectGroup);
}

export default function(state = defaultState, action) {
  switch (action.type) {
    case 'REQEUST_FETCH_GUEST':
      return state.set('fetching', true);

    case 'RECEIVE_GUEST':
      return receiveSettings(state, action.data);

    case 'CHANGE_GUEST_GROUP':
      return changeGroup(state, action.name);

    case 'CHANGE_GUEST_SETTINGS':
      return state.mergeDeepIn(['data', 'curr'], action.data);

    default:

  }
  return state;
}
