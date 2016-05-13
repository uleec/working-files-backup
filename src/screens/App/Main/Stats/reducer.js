import {Map, List, fromJS} from 'immutable';

function setFetching(state) {
  return state.update('fetching', val => true);
}

function updateData(state, name, value) {
  return state.updateIn(['data', name], val => value);
}

let defaultState = fromJS({
  fetching: false,
  query: {
    sort_type: 1,
    time_type: 'today' 
  },
  data: {
    apInfo: {},
    clientInfo: {
      
    },
    aplist: [],
    clientlist: []
  }
});

export default function(state = defaultState, action) {
  switch (action.type) {
    case 'REQEUST_STATS':
      return setFetching(state);

    case 'REVEVICE_STATS':
      return state.mergeIn(['data'], action.data);

  }
  return state;
};