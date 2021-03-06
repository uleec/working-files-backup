import { fromJS } from 'immutable';

const defaultState = fromJS({
  popOver: {
    isShow: false,

    // 'vlanAsider' 'groupAsider' 'topMenu'
    name: 'topMenu',
  },
  nav: {
    show: true,
  },

  // 弹出框配置，
  modal: {
    isShow: false,
    size: 'lg',
    name: 'group',
  },
  modalList: [],

  // Ap组相关
  group: {
    selected: {
      id: '',
    },
    manageSelected: {},
    addData: {
      groupname: '',
      remark: '',
    },
    apAddData: {
      // 类型：custom（自定义），auto（为分组ap列表）
      type: 'custom',
      apmac: '',
      name: '',
      model: '',
    },
    apMoveData: {
      targetGroupId: -1,
    },
    list: [],

    // 当前管理组内设备列表
    devices: [],
  },

  // Model 相关
  model: {
    list: [],
  },

  // 未分组设备列表
  defaultDevices: [],
});

function togglePopOverState(state, option) {
  const thisOption = option || {};

  if (thisOption.isShow === undefined) {
    thisOption.isShow = !state.getIn(['popOver', 'isShow']);
  }

  return state.mergeIn(['popOver'], thisOption);
}

function changeModalState(state, option) {
  const myOption = option || {};
  let modalList = state.get('modalList') || fromJS([]);
  let targetModal = state.get('modal');

  if (myOption.isShow === undefined) {
    myOption.isShow = !state.getIn(['modal', 'isShow']);
  }

  if (myOption.okButton === undefined) {
    myOption.okButton = true;
  }
  if (myOption.cancelButton === undefined) {
    myOption.cancelButton = true;
  }

  targetModal = targetModal.merge(myOption);

  // 如果是打开窗口
  if (targetModal.get('isShow')) {
    modalList = modalList.push(targetModal);
  } else {
    modalList = modalList.pop();
    if (modalList.size > 0) {
      targetModal = modalList.last();
    }
  }

  return state.set('modal', targetModal)
    .set('modalList', modalList);
}
function showPrevModel(state) {
  const prevModal = state.get('prevModal');
  let ret = state;

  if (prevModal && prevModal.get('isShow')) {
    ret = state.set('modal', prevModal);
  }

  return ret;
}

function receiveApGroup(state, action) {
  const payload = action.payload || {};
  const $$list = fromJS(payload.list);
  let $$defaultItem = $$list.get(0) || fromJS({});
  const $$defaultManageItem = $$list.get(1) || fromJS({});
  let $$selectedItem = state.getIn(['group', 'selected']);
  let $$manageSelectedItem = state.getIn(['group', 'manageSelected']);
  let $$rcSelectedItem = null;
  let $$rcManageSelectedItem = null;

  if ($$list.size > 1) {
    $$defaultItem = $$list.get(1);
  }

  // 当前显示的组
  if ($$selectedItem.isEmpty()) {
    $$selectedItem = $$defaultItem;

  // 判断选择的是否被删除
  } else {
    $$rcSelectedItem = $$list.find(
      $$item => $$item.get('id') === $$selectedItem.get('id'),
    );

    $$selectedItem = $$rcSelectedItem || $$defaultItem;
  }

  // 当前正在管理的组
  if ($$manageSelectedItem.isEmpty()) {
    $$manageSelectedItem = $$defaultManageItem;

  // 判断选择的是否被删除
  } else {
    $$rcManageSelectedItem = $$list.find(
      item => item.get('id') === $$manageSelectedItem.get('id'),
    );
    $$manageSelectedItem = $$rcManageSelectedItem || $$defaultManageItem;
  }

  return state.setIn(['group', 'selected'], $$selectedItem)
    .setIn(['group', 'manageSelected'], $$manageSelectedItem)
    .setIn(['group', 'list'], $$list);
}

function receiveDevices(state, action) {
  const payload = action.payload || {};
  const page = payload.page || [];
  const rcList = payload.list || [];
  let ret = state;
  // 如果是默认ap
  if (action.meta) {
    ret = ret.set('defaultDevices', fromJS(rcList))
      .set('defaultDevicesPage', fromJS(page));
  } else {
    ret = ret.setIn(['group', 'devices'], fromJS(rcList))
      .setIn(['group', 'devicesPage'], fromJS(page));
  }

  return ret;
}

function selectList(state, name, id) {
  const $$selectedItem = state.getIn([name, 'list'])
      .find(item => item.get('id') === id) ||
      state.getIn([name, 'selected']);

  return state.setIn([name, 'selected'], $$selectedItem);
}

function selectManageList(state, name, id) {
  const $$selectedItem = state.getIn([name, 'list'])
      .find(item => item.get('id') === id) ||
      state.getIn([name, 'manageSelected']);

  return state.setIn([name, 'manageSelected'], $$selectedItem);
}

function selectAddGroupDevices(state, action) {
  const data = action.payload;
  let defaultDevices = state.get('defaultDevices');

  if (data.index !== -1) {
    defaultDevices = defaultDevices.setIn([data.index, '__selected__'], data.selected);
  } else {
    defaultDevices = defaultDevices.map(item => item.set('__selected__', data.selected));
  }
  return state.set('defaultDevices', defaultDevices);
}

function selectManageGroupDevices(state, action) {
  const data = action.payload;
  let $$devices = state.getIn(['group', 'devices']);

  if (data.index !== -1) {
    $$devices = $$devices.setIn([data.index, '__selected__'], data.selected);
  } else {
    $$devices = $$devices.map(item => item.set('__selected__', data.selected));
  }
  return state.setIn(['group', 'devices'], $$devices);
}

function rcModelList(state, action) {
  const modalOptions = action.payload.list.map(
    item => ({
      value: item.name,
      label: item.name,
    }),
  );
  return state.mergeIn(['model'], action.payload)
    .setIn(['model', 'options'], modalOptions);
}

function toggleNavState(state) {
  const curNavState = state.getIn(['nav', 'show']);

  return state.setIn(['nav', 'show'], !curNavState);
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case 'TOGGLE_MAIN_POP_OVER':
      return togglePopOverState(state, action.option);

    case 'main/TOGGLE_MAIN_NAV':
      return toggleNavState(state);

    // Modal 操作相关
    case 'SHOW_MAIN_MODAL':
      return changeModalState(state, action.option);

    case 'SHOW_PREV_MAIN_MODAL':
      return showPrevModel(state);

    // AP型号相关操作
    case 'RC_FETCH_MODEL_LIST':
      return rcModelList(state, action);

    // 组操作
    case 'SELECT_GROUP':
      return selectList(state, 'group', action.id);
    case 'SELECT_MANAGE_GROUP':
      return selectManageList(state, 'group', action.id);
    case 'SELECT_MANAGE_GROUP_AP':
      return selectManageGroupDevices(state, action);

    case 'RC_FETCH_AP_GROUP':
      return receiveApGroup(state, action);

    case 'RC_FETCH_GROUP_APS':
      return receiveDevices(state, action);

    case 'SELECT_ADD_AP_GROUP_DEVICE':
      return selectAddGroupDevices(state, action);

    case 'UPDATE_GROUP_ADD_DEVICE':
      return state.mergeIn(['group', 'apAddData'], action.payload);
    case 'RESET_GROUP_ADD_DEVICE':
      return state.setIn(['group', 'apAddData'], fromJS({
        type: 'custom',
        apmac: '',
        name: '',
        model: '',
      }));

    case 'UPDATE_ADD_AP_GROUP':
      return state.mergeIn(['group', 'addData'], action.payload);

    case 'UPDATE_EDIT_AP_GROUP':
      return state.mergeIn(['group', 'manageSelected'], action.payload);

    case 'UPDATE_GROUP_MOVE_DEVICE':
      return state.mergeIn(['group', 'apMoveData'], action.payload);

    default:
  }
  return state;
}
