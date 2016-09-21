import { fromJS, List } from 'immutable';

const defaultState = fromJS({
  macstatus: [
  ],
  macInput: {
    macValue: '',
    preLen: 0,
  },

});

function onInitMacStatus(state, action) {
  // console.log('len', action.len);
  const list = [];
  let i = 0;
  console.log('i');
  while (i < action.len) {
    console.log('i', i);
    list.push(false);
    i++;
  }
  return state.set('macstatus', fromJS(list));
}

function onUpdateMacStatus(state, action) {
  const statusList = state.get('macstatus').toJS();
  const status = statusList[action.index];
  console.log(statusList[action.index]);
  return state.setIn(['macstatus', action.index], !status);
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case 'INIT_MAC_STATUS':
      return onInitMacStatus(state, action);
    case 'UPDATE_MAC_STATUS':
      return onUpdateMacStatus(state, action);
    case 'CHANGE_MAC_INPUT':
      return state.setIn(['macInput', 'macValue'], action.data);
    case 'CHANGE_PRE_LEN_IN_MAC_INPUT':
      return state.setIn(['macInput', 'preLen'], action.data);
    default:
  }
  return state;
}