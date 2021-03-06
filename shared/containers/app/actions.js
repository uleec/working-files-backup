import { toastr } from 'react-redux-toastr';
import ERROR_MSG_MAP from 'shared/config/serverError';
import utils from 'shared/utils';
import ACTION_TYPES from './actionTypes';
import { addScreen } from '../appScreen/actions';

const APP_CONFIG = {
  fetchInfo: '/goform/getAcInfo',
};
let refreshAllTimeout = null;


export function updateRouter(payload) {
  return {
    type: ACTION_TYPES.UPDATE_ROUTER,
    payload,
  };
}

export const addAppScreen = addScreen;

// 数据刷新
function doRefresh() {
  return {
    type: ACTION_TYPES.REFRESH_ALL,
    refreshAt: Date.now(),
  };
}
export function refreshAll() {
  return (dispatch) => {
    // 防止频繁的点击不停刷新
    clearTimeout(refreshAllTimeout);

    refreshAllTimeout = setTimeout(
      () => {
        refreshAllTimeout = null;
        dispatch(doRefresh());
      },
      240,
    );
  };
}

export function createModal(data) {
  return {
    type: ACTION_TYPES.CREATE_MODAL,
    data,
  };
}

export function changeModalState(data) {
  return {
    type: ACTION_TYPES.CHANGE_MODAL_STATE,
    data,
  };
}

export function closeModal(data) {
  return (dispatch, getState) => {
    const handleOk = getState().app.getIn(['modal', 'apply']);
    const handleCancel = getState().app.getIn(['modal', 'cancel']);
    const myData = data || { status: 'hide' };

    dispatch(changeModalState(myData));

    // 处理 Apply
    if (myData.status === 'ok' && typeof handleOk === 'function') {
      handleOk();

    // 处理 Cancel
    } else if (myData.status === 'cancel' && typeof handleCancel === 'function') {
      handleCancel();
    }
  };
}

export function receiveFetchProductInfo(data) {
  return {
    type: ACTION_TYPES.RECEIVE_PRODUCT_INFO,
    data,
  };
}


/**
 * 保存Ajax请求开始
 * @export
 * @returns Action 对象
 */
export function requestSave() {
  return {
    type: ACTION_TYPES.REQUEST_SAVE,
  };
}

export function receiveSave(state) {
  return {
    type: ACTION_TYPES.RECEIVE_SAVE,
    savedAt: Date.now(),
    state,
  };
}

export function receiveAjaxError(payload) {
  return {
    type: ACTION_TYPES.RECEIVE_AJAX_ERROR,
    payload,
  };
}
export function receiveServerError(state) {
  let errorMsg = state.msg;

  // 显示服务器错误
  if (state.code >= 6000) {
    if (ERROR_MSG_MAP[state.code]) {
      errorMsg = ERROR_MSG_MAP[state.code];
    }
    toastr.error(__('Data Sync Error'), __(errorMsg));
  } else if (state.code === 4000) {
    // toastr.error(__('Data Sync Error'), __('Data Sync Error'));
  }

  return {
    type: ACTION_TYPES.RECEIVE_SERVER_ERROR,
    payload: utils.extend({}, state, {
      errorAt: Date.now(),
    }),
  };
}

/**
 * 全局Ajax fetch action
 */
export function rqFetch() {
  return {
    type: ACTION_TYPES.RQ_FETCH,
  };
}
export function rcFetch() {
  return {
    type: ACTION_TYPES.RC_FETCH,
  };
}

function ajaxErrorCallback(dispatch, type, url) {
  return (error) => {
    dispatch(receiveAjaxError({
      type,
      url,
      error,
    }));
  };
}

export function fetch(url, query, option) {
  return (dispatch) => {
    const errorFunc = ajaxErrorCallback(
      dispatch,
      'fetch',
      url,
    );

    dispatch(rqFetch());

    return utils.fetch(url, query, option)
      .then((json) => {
        dispatch(rcFetch());

        if (json === undefined) {
          return {};
        }
        // AP产品 无登录权限
        if (json.state && json.state.code === 4040) {
          window.location.href = '#';
        } else if (!json.state || (json.state && json.state.code !== 2000)) {
          dispatch(receiveServerError(json.state));
        }

        return json;
      })
      .catch(errorFunc);
  };
}

/**
 * 全局Ajax save action
 * @export
 * @param {String} url
 * @param {Object} query
 * @returns Fetch Promise 对象
 */
export function save(url, query, option) {
  return (dispatch) => {
    const errorFunc = ajaxErrorCallback(
      dispatch,
      'save',
      url,
    );

    dispatch(requestSave());

    return utils.save(url, query, option)
      .then((json) => {
        dispatch(receiveSave());

        if (json === undefined) {
          return {};
        }
        if (json.state && json.state.code === 4040) {
          window.location.href = '#';
        } else if (!json.state || (json.state && json.state.code !== 2000)) {
          dispatch(receiveServerError(json.state));
        }
        return json;
      })
      .catch(errorFunc);
  };
}

/**
 * 全局Ajax save 带文件的表单
 * @export
 * @param {String} url
 * @param {Element} form表单元素
 * @returns Fetch Promise 对象
 */
export function saveFile(url, formElem, option) {
  return (dispatch) => {
    const errorFunc = ajaxErrorCallback(
      dispatch,
      'saveFile',
      url,
    );
    dispatch(requestSave());

    return utils.postForm(url, formElem, option)
      .then((json) => {
        if (json === undefined) {
          return {};
        }

        // 登录超时
        if (json.state && json.state.code === 4040) {
          window.location.href = '#';

        // 数据返回不正常
        } else if (!json.state || (json.state && json.state.code !== 2000)) {
          dispatch(receiveServerError(json.state));
        }
        dispatch(receiveSave());
        return json;
      })
      .catch(errorFunc);
  };
}

export function fetchProductInfo(url) {
  return (dispatch) => {
    const fetchUrl = url || APP_CONFIG.fetchInfo;
    return dispatch(fetch(fetchUrl))
      .then((json) => {
        if (json && json.state && json.state.code === 2000) {
          dispatch(receiveFetchProductInfo(json.data));
        }

        return json;
      });
  };
}


/**
 * Validate data
 */
export function startValidateAll(formId) {
  return {
    type: ACTION_TYPES.START_VALIDATE_ALL,
    payload: {
      validateAt: Date.now(),
      formId,
    },
  };
}

/**
 *
 *
 * @export
 * @param {function} func 验证完成后的回调函数
 * @param {Sting} formId 具体的表单ID（没有则验证界面所有可视元素）
 * @returns
 */
export function validateAll(formId, func) {
  return (dispatch, getState) => {
    let validatePromise = null;

    dispatch(startValidateAll(formId));
    validatePromise = new Promise((resolve) => {
      setTimeout(() => {
        const invalid = getState().app.get('invalid');
        if (typeof func === 'function') {
          func(invalid);
        }
        resolve(invalid);
      }, 5);
    });
    return validatePromise;
  };
}

export function resetVaildateMsg() {
  return {
    type: ACTION_TYPES.RESET_VALIDATE_MSG,
  };
}

export function reportValidError(data) {
  return {
    type: ACTION_TYPES.REPORT_VALID_ERROR,
    data,
  };
}

export function initAppConfig(payload) {
  return {
    type: ACTION_TYPES.INIT_CONFIG,
    payload,
  };
}

/**
 * Login
 */
// 修改登录相关对象
export function changeLoginState(payload) {
  return {
    type: ACTION_TYPES.CHANGE_LOGIN_STATE,
    payload,
  };
}

// 修改登录状态值
export function changeLoginStatus(data) {
  return {
    type: ACTION_TYPES.CHANGE_LOGIN_STATUS,
    data,
  };
}
