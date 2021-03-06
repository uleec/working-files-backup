import {
  fromJS,
} from 'immutable';
import ACTION_TYPES from './actionTypes';

const defaultItem = fromJS({
  fetching: false,
  saving: false,
  query: {
    type: '0',
    size: 20,
    page: 1,
    search: '',
  },
  data: {
    settings: {},
    list: [],
  },

  // 用于保存Screen自定义属性
  customProps: {},

  //
  curList: [],

  curListKeys: {
    pageDataKey: 'page',
    listDataKey: 'list',
    selectedListKey: 'selectedList',
    id: '',
  },

  // 页面全局配置
  curSettings: {},
  defaultSettings: {},

  // 当前正在操作的列表项
  curListItem: {},
  defaultListItem: {},

  // 操作相关查询对象
  actionQuery: {},
});
const defaultState = fromJS({
  curScreenId: 'base',
  base: defaultItem,
});

/**
 * Init screen state
 *
 * @param {immutable} state
 * @param {object} action
 * @returns New immutable state
 */
function initScreenState($$state, action) {
  const screenId = action.payload.id;
  const defaultSettings = action.payload.defaultSettings;
  let $$ret = $$state;
  let $$settingsData = $$ret.getIn([screenId, 'curSettings']) || fromJS({});
  let $$myScreenState = $$ret.get(screenId);

  // 第一次初始化
  if (!$$myScreenState) {
    $$myScreenState = defaultItem.mergeDeep(action.payload);

    // 更新
  } else {
    $$myScreenState = $$myScreenState.mergeDeep(action.payload);
  }


  // 只有当 $$settingsData 为空时才合并默认Settings
  if (defaultSettings && $$settingsData.isEmpty()) {
    $$settingsData = $$settingsData.mergeDeep(defaultSettings);
  }

  // 如何处理 screen的第一次初始化与其他初始
  $$ret = $$ret.mergeDeepIn(
    [screenId],
    $$myScreenState.set('curSettings', $$settingsData),
  );

  if (screenId) {
    $$ret = $$ret.set('curScreenId', screenId);
  }

  return $$ret;
}

/**
 * 向列表中添加项
 *
 * @param {any} $$state
 * @param {any} action
 */
function addListItem($$state, curScreenName, action) {
  const defaultListItem = $$state.getIn([curScreenName, 'defaultListItem']) || fromJS({});
  const meta = action.meta;
  let $$ret = $$state;

  $$ret = $$ret.setIn(
    [curScreenName, 'curListItem'],
    defaultListItem.mergeDeep(action.payload),
  )
    .mergeIn([curScreenName, 'actionQuery'], {
      action: 'add',
      myTitle: __('Add'),
    });

  if (meta) {
    $$ret = $$ret.mergeIn([curScreenName, 'curListKeys'], meta);
  }

  return $$ret;
}

/**
 * Change the selected list data, save the selected
 *
 * @param {immutable} state
 * @param {any} data
 * @param {string} curScreenName
 * @returns New immutable state
 */
function selectedListItem(state, action, curScreenName) {
  const data = action.payload;
  const meta = action.meta;
  const listDataKey = meta.listDataKey || 'list';
  const selectedListKey = meta.selectedListKey;
  let list = state.getIn([curScreenName, 'data', listDataKey]);
  let $$selectedList = state.getIn([curScreenName, 'actionQuery', selectedListKey]) || fromJS([]);
  let $$ret = state;

  if (data.index !== -1) {
    list = list.setIn([data.index, '__selected__'], data.selected);
    if (data.selected) {
      $$selectedList = $$selectedList.push(data.index);
    } else {
      $$selectedList = $$selectedList.delete(
        $$selectedList.indexOf(data.index),
      );
    }
  } else {
    $$selectedList = fromJS([]);

    if (data.selected) {
      list = list.map((item, index) => {
        let $$retItem = item;

        if (data.unselectableList.indexOf(index) === -1) {
          $$selectedList = $$selectedList.push(index);
          $$retItem = $$retItem.set('__selected__', true);
        }
        return $$retItem;
      });
    } else {
      list = list.map(item => item.set('__selected__', false));
    }
  }

  $$ret = $$ret.setIn([curScreenName, 'data', listDataKey], list)
    .setIn([curScreenName, 'actionQuery', selectedListKey], $$selectedList);

  if (meta) {
    $$ret = $$ret.mergeIn([curScreenName, 'curListKeys'], meta);
  }

  return $$ret;
}

function updateCurListItem(curScreenName, state, action) {
  const curIndex = state.getIn([curScreenName, 'actionQuery', 'index']);
  const curListDataKey = state.getIn([curScreenName, 'curListKeys', 'listDataKey']);
  let ret = state.mergeDeepIn([curScreenName, 'curListItem'], action.payload);

  if (action.meta.sync) {
    ret = ret.mergeDeepIn([curScreenName, 'data', curListDataKey, curIndex], action.payload);
  }

  return ret;
}

/**
 * 激活对列表某项额操作
 *
 * @param {any} state
 * @param {any} curScreenName
 * @param {any} action
 * @returns
 */
function activeListItem(state, curScreenName, action) {
  const defaultListItem = state.getIn([curScreenName, 'defaultListItem']) || fromJS({});
  const meta = action.meta;
  let $$ret = state;
  let listItemIndex = 0;
  let myItem = fromJS({});
  let $$curList = null;

  if (meta) {
    $$ret = $$ret.mergeIn([curScreenName, 'curListKeys'], meta);
  }

  $$curList = $$ret.getIn(
    [
      curScreenName,
      'data',
      $$ret.getIn([curScreenName, 'curListKeys', 'listDataKey']),
    ],
  );

  if (action.payload.keyName === '__index__') {
    listItemIndex = action.payload.val;
  } else {
    listItemIndex = $$curList.findIndex(
      item => item.get(action.payload.keyName) === action.payload.val,
    );
  }

  myItem = $$curList.get(listItemIndex);

  $$ret = $$ret.setIn(
    [curScreenName, 'curListItem'],
    defaultListItem.merge(myItem),
  )
    .mergeIn([curScreenName, 'actionQuery'], {
      action: action.payload.action || 'edit',
      myTitle: `${__('Edit')}: ${action.payload.val}`,
      index: listItemIndex,
    });

  return $$ret;
}

/**
 * 接收数据
 *
 * @param {any} $$state
 * @param {any} curScreenName
 * @param {any} action
 * @returns
 */
function receiveScreenData($$state, curScreenName, action) {
  const selectedListKey = $$state.getIn([curScreenName, 'curListKeys', 'selectedListKey']);
  let $$ret = $$state;
  let $$selectedList = $$state.getIn([curScreenName, 'actionQuery', selectedListKey]);

  if (action.payload && action.payload.settings) {
    $$ret = $$ret.mergeDeepIn([curScreenName, 'curSettings'], action.payload.settings);
  }

  // 如果接受新的 list，清空已选择状态
  if (action.payload && action.payload.list) {
    $$selectedList = fromJS([]);
  }

  return $$ret.setIn([curScreenName, 'fetching'], false)
    .mergeIn([curScreenName, 'data'], action.payload)
    .setIn([curScreenName, 'data', 'updateAt'], action.meta.updateAt)
    .setIn([curScreenName, 'actionQuery', selectedListKey], $$selectedList);
}

/**
 * 添加 app Screen
 *
 * @param {any} state
 * @param {any} action
 * @returns
 */
function addScreen(state, action) {
  let $$ret = state;
  const curScreenId = action.payload && action.payload.id;

  // 没有 curScreenId 不做任何修改
  if (typeof curScreenId === 'undefined') {
    return $$ret;
  }

  // 为空时才添加 Screen 默认值
  if (!$$ret.get(curScreenId)) {
    $$ret = state.set(curScreenId, defaultItem);
  }

  if (action.payload.route) {
    $$ret = $$ret.mergeIn(
      [action.payload.id],
      fromJS(action.payload.route).delete('routes'),
    );
  }
  return $$ret.set('curScreenId', curScreenId);
}

function updateSettings(state, curScreenName, action) {
  let $$ret = state;

  if (action.meta && action.meta.replace) {
    $$ret = $$ret.setIn([curScreenName, 'curSettings'], fromJS(action.payload));
  } else {
    $$ret = $$ret.mergeDeepIn([curScreenName, 'curSettings'], action.payload);
  }


  return $$ret;
}

export default function (state = defaultState, action) {
  const curScreenName = (action.meta && action.meta.name) || state.get('curScreenId');

  switch (action.type) {
    // Screen 全局 action
    case ACTION_TYPES.ADD:
      return addScreen(state, action);
    case ACTION_TYPES.INIT:
      return initScreenState(state, action, curScreenName);
    case ACTION_TYPES.UPDATE:
      return state.merge(action.payload);

    case ACTION_TYPES.LEAVE:
      return state.mergeIn([curScreenName, 'query'], {
        search: '',
      })
        .setIn([curScreenName, 'curListItem'], defaultItem.get('curListItem'))
        .setIn([curScreenName, 'actionQuery'], fromJS({
          action: '',
        }));

    case ACTION_TYPES.CHANGE_SAVE_STATUS:
      return state.setIn([curScreenName, 'saving'], action.payload);

    case ACTION_TYPES.REQUEST_FETCH_DATA:
      return state.setIn([curScreenName, 'fetching'], true);

    case ACTION_TYPES.UPDATE_CUSTOM_PROPS:
      return state.mergeDeepIn([curScreenName, 'customProps'], action.payload);

    case ACTION_TYPES.RECEIVE_DATA:
      return receiveScreenData(state, curScreenName, action);

    // appScreen 操作
    case ACTION_TYPES.CHANGE_QUERY:
      return state.mergeIn([curScreenName, 'query'], action.payload);

    case ACTION_TYPES.CHANGE_ACTION_QUERY:
      return state.mergeIn([curScreenName, 'actionQuery'], action.payload);

      // Screen Setting相关
    case ACTION_TYPES.UPDATE_SETTINGS:
      return updateSettings(state, curScreenName, action);

    // 对列表中某项的操作
    case ACTION_TYPES.ADD_LIST_ITEM:
      return addListItem(state, curScreenName, action);

    case ACTION_TYPES.ACTIVE_LIST_ITEM:
      return activeListItem(state, curScreenName, action);

    case ACTION_TYPES.UPDATE_LIST_ITEM_BY_INDEX:
      return state.mergeDeepIn(
        [curScreenName, 'data', 'list', action.meta.index],
        action.payload,
      );

    case ACTION_TYPES.SELECT_LIST_ITEM:
      return selectedListItem(state, action, curScreenName);

    // 更新列表正在操作的项
    case ACTION_TYPES.UPDATE_CUR_EDIT_LIST_ITEM:
      return updateCurListItem(curScreenName, state, action);

    case ACTION_TYPES.CLEAR_CUR_LIST_ITEM:
      return state.setIn(
        [curScreenName, 'curListItem'],
        fromJS({}),
      );

    case ACTION_TYPES.CLOSE_LIST_ITEM_MODAL:
      return state.setIn([curScreenName, 'actionQuery', 'action'], '');

    default:
  }
  return state;
}
