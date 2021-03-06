import React from 'react'; import PropTypes from 'prop-types';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import validator from 'shared/validator';
import { bindActionCreators } from 'redux';

import { actions as appActions } from 'shared/containers/app';
import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';

function getPortList() {
  return utils.fetch('goform/network/port')
    .then(json => (
      {
        options: json.data.list.filter(
          item => item,
        ).map(
          item => ({
            value: item.name,
            label: item.name,
          }),
        ),
      }
    ),
  );
}

function getPortalServerList() {
  return utils.fetch('/goform/network/portal/server')
    .then(json => (
      {
        options: json.data.list.filter(
          item => item,
        ).map(
          item => ({
            value: item.template_name,
            label: item.template_name,
          }),
        ),
      }
    ),
  );
}

const listOptions = fromJS([
  {
    id: 'interface_bind',
    label: __('Port'),
    formProps: {
      type: 'switch',
      required: true,
    },
  }, {
    id: 'template_name',
    label: __('Server Name'),
    formProps: {
      type: 'select',
      required: true,
      notEditable: true,
    },
  }, {
    id: 'max_usernum',
    label: __('Max Users'),
    defaultValue: '4096',
    formProps: {
      type: 'number',
      min: '5',
      max: '4096',
    },
  }, {
    id: 'auth_mode',
    label: __('Authentication Type'),
    defaultValue: '1',
    options: [
      {
        value: '1',
        label: __('Direct'),
      },
      {
        value: '2',
        label: __('Layer3'),
      },
    ],
    formProps: {
      type: 'switch',
    },
  }, {
    id: 'auth_ip',
    label: __('Authentication IP'),
    formProps: {
      type: 'text',
      validator: validator({
        rules: 'ip',
      }),
      required: true,
      visible(data) {
        return data.get('auth_mode') === '2';
      },
    },
  }, {
    id: 'auth_mask',
    label: __('Authentication Subnet Mask'),
    formProps: {
      type: 'text',
      validator: validator({
        rules: 'mask',
      }),
      required: true,
      visible(data) {
        return data.get('auth_mode') === '2';
      },
    },
  },
  {
    id: 'idle_test',
    label: __('Auto Re-login'),
    defaultValue: '0',
    formProps: {
      type: 'checkbox',
      value: '1',
    },
  },
]);

const propTypes = {
  store: PropTypes.instanceOf(Map),
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      portOptions: fromJS([]),
      portalServerOption: fromJS([]),
    };
  }
  componentWillMount() {
    getPortList()
      .then((data) => {
        this.setState({
          portOptions: fromJS(data.options),
        });
      });

    getPortalServerList()
      .then((data) => {
        this.setState({
          portalServerOption: fromJS(data.options),
        });
      });
  }

  render() {
    const { store } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    const actionType = $$myScreenStore.getIn(['actionQuery', 'action']);
    const $$curList = $$myScreenStore.getIn(['data', 'list']);
    const myPortOptions = this.state.portOptions
      .filterNot(($$item) => {
        const curPort = $$item.get('value');
        const curPortIndex = $$curList.findIndex($$listItem => $$listItem.get('interface_bind') === curPort);
        let ret = curPortIndex !== -1;

        if (actionType === 'edit' && $$myScreenStore.getIn(['curListItem', 'id']) === $$curList.getIn([curPortIndex, 'id'])) {
          ret = false;
        }

        return ret;
      });
    const myPortalServerOption = this.state.portalServerOption
      .filterNot(($$item) => {
        const curServerName = $$item.get('value');
        const curIndex = $$curList.findIndex($$listItem => $$listItem.get('template_name') === curServerName);
        let ret = curIndex !== -1;

        if (actionType === 'edit' && $$myScreenStore.getIn(['curListItem', 'id']) === $$curList.getIn([curIndex, 'id'])) {
          ret = false;
        }

        return ret;
      });
    const curListOptions = listOptions.map(
      ($$item) => {
        const curId = $$item.get('id');

        switch (curId) {
          case 'interface_bind':
            return $$item.set('options', myPortOptions);

          case 'template_name':
            return $$item.set('options', myPortalServerOption);
          default:
            return $$item;
        }
      },
    );
    // deleteable 和 editable 如果返回index, index为O，强制转换为了false, 所以会导致第一条记录也不能显示删除和编辑按钮（参看AppScreenList）。
    return (
      <AppScreen
        {...this.props}
        store={store}
        listKey="template_name"
        listOptions={curListOptions}
        maxListSize="6"
        deleteable={
          ($$item) => { if ($$item.get('interface_bind') !== 'lo') return true; }
        }
        editable={
          ($$item) => { if ($$item.get('interface_bind') !== 'lo') return true; }
        }
        actionable
        selectable
        noTitle
      />
    );
  }
}

View.propTypes = propTypes;
View.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.screens,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    screenActions,
  ), dispatch);
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(View);
