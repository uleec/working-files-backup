import { actions as appActions } from 'shared/containers/app';
import utils from 'shared/utils';

export function toggleMainPopOver(option) {
  return {
    type: 'TOGGLE_MAIN_POP_OVER',
    option,
  };
}

export function showMainModal(option) {
  return {
    type: 'SHOW_MAIN_MODAL',
    option,
  };
}

export function toggleMainNav() {
  return {
    type: 'main/TOGGLE_MAIN_NAV',
  };
}

export function showPrevMainModal() {
  return {
    type: 'SHOW_PREV_MAIN_MODAL',
  };
}

export function selectVlan(id) {
  return {
    type: 'SELECT_VLAN',
    id,
  };
}

export function selectGroup(id) {
  return {
    type: 'SELECT_GROUP',
    id,
  };
}
export function selectManageGroup(id) {
  return {
    type: 'SELECT_MANAGE_GROUP',
    id,
  };
}
export function selectManageGroupAp(data) {
  return {
    type: 'SELECT_MANAGE_GROUP_AP',
    payload: data,
  };
}

// 获取AP型号列表
export function rcFetchModelList(data) {
  return {
    type: 'RC_FETCH_MODEL_LIST',
    payload: data,
  };
}
export function fetchModelList() {
  return dispatch => dispatch(
      appActions.fetch('goform/system/ap/model', {
        page: 1,
        size: 500,
      }),
    ).then((json) => {
      if (json.state && json.state.code === 2000) {
        dispatch(rcFetchModelList(json.data));
      }
    });
}

// 获取AP组列表
export function rcFetchApGroup(data) {
  return {
    type: 'RC_FETCH_AP_GROUP',
    payload: data,
  };
}
export function fetchApGroup() {
  return dispatch => dispatch(appActions.fetch('goform/group'))
    .then((json) => {
      if (json.state && json.state.code === 2000) {
        dispatch(rcFetchApGroup(json.data));
      }
    });
}

// 获取组内 AP
function rcFetchGroupAps(json, isDefault) {
  return {
    type: 'RC_FETCH_GROUP_APS',
    payload: json.data,
    meta: isDefault,
  };
}

export function fetchGroupAps(id, query) {
  return (dispatch, getState) => {
    const productState = getState().product;
    const groupid = id || productState.getIn(['group', 'selected', 'id']);
    const curQuery = {
      groupid,
      size: 20,
      page: 1,
    };
    const isDefault = groupid === -1;

    // 如果没有 groupid 不请求数据
    if (!groupid && groupid !== 0) {
      return null;
    }

    if (query) {
      utils.extend(curQuery, query);
    }

    return dispatch(appActions.fetch('goform/group/aps', curQuery))
      .then((json) => {
        if (json) {
          dispatch(rcFetchGroupAps(json, isDefault));
        }
      });
  };
}

export function selectAddApGroupDevice(data) {
  return {
    type: 'SELECT_ADD_AP_GROUP_DEVICE',
    payload: data,
  };
}

export function updateAddApGroup(data) {
  return {
    type: 'UPDATE_ADD_AP_GROUP',
    payload: data,
  };
}

export function updateEditApGroup(data) {
  return {
    type: 'UPDATE_EDIT_AP_GROUP',
    payload: data,
  };
}
export function updateGroupAddDevice(data) {
  return {
    type: 'UPDATE_GROUP_ADD_DEVICE',
    payload: data,
  };
}

export function resetGroupAddDevice() {
  return {
    type: 'RESET_GROUP_ADD_DEVICE',
  };
}

export function updateGroupMoveDevice(data) {
  return {
    type: 'UPDATE_GROUP_MOVE_DEVICE',
    payload: data,
  };
}
