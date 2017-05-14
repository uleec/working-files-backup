import React from 'react'; import PropTypes from 'prop-types';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import { bindActionCreators } from 'redux';
import { Button, Modal} from 'shared/components';
import { actions as appActions } from 'shared/containers/app';
import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';
import validator from 'shared/validator';

const propTypes = {
  store: PropTypes.instanceOf(Map),
  app: PropTypes.instanceOf(Map),
  test: PropTypes.number,
  updateScreenSettings: PropTypes.func,
};
const defaultProps = {
  test: 0,
};
const settingsOptions = fromJS([
  // {
  //   id: 'bas_ip',
  //   label: __('Bas IP'),
  //   fieldset: 'base_setting',
  //   className: 'cols col-6',
  //   required: true,
  //   type: 'text',
  //   validator: validator({
  //     rules: 'ip',
  //     exclude: '127.0.0.1',
  //   }),
  // },
  {
    id: 'bas_port',
    fieldset: 'base_setting',
    className: 'cols col-6',
    label: __('Bas Port'),
    type: 'number',
    required: true,
    min: '1',
    max: '65535',
    validator: validator({
      rules: 'num:[1,65535]',
    }),
  },
  {
    id: 'sharedSecret',
    required: true,
    type: 'password',
    className: 'cols col-6',
    fieldset: 'base_setting',
    label: __('Shared Secret'),
    maxLength: '128',
    validator: validator({
      rules: 'pwd',
    }),
  },
  {
    id: 'bas_user',
    type: 'text',
    required: true,
    className: 'cols col-6',
    fieldset: 'base_setting',
    maxLength: '129',
    label: __('User'),
    validator: validator({
      rules: 'utf8Len:[1, 128]',
    }),
  },
  {
    id: 'bas_pwd',
    type: 'password',
    required: true,
    className: 'cols col-6',
    fieldset: 'base_setting',
    label: __('Password'),
    maxLength: '128',
    validator: validator({
      rules: 'pwd',
    }),
  },
  {
    id: 'bas',
    required: true,
    fieldset: 'base_setting',
    className: 'cols col-6',
    label: __('Device Type'),
    type: 'select',
    defaultValue: '0',
    options: [
      {
        value: '0',
        label: __('Standard'),
      },
    ],
  },
  {
    id: 'portalVer',
    fieldset: 'base_setting',
    className: 'cols col-6',
    required: true,
    label: __('Portal Vertion'),
    type: 'select',
    defaultValue: '1',
    options: [
      {
        value: '1',
        label: __('V1/CMCC'),
      }, {
        value: '2',
        label: __('V2'),
        disabled: true,
      },
    ],
  },
  {
    id: 'authType',
    required: true,
    fieldset: 'base_setting',
    className: 'cols col-6',
    label: __('Authentication Type'),
    type: 'select',
    defaultValue: '1',
    options: [
      {
        value: '0',
        label: __('PAP'),
        disabled: true,
      }, {
        value: '1',
        label: __('CHAP'),
      },
    ],
  },
  {
    id: 'timeoutSec',
    required: true,
    type: 'number',
    fieldset: 'base_setting',
    className: 'cols col-6',
    label: __('Time out'),
    min: '0',
    max: '10',
    defaultValue: '4',
    help: __('Second'),
    validator: validator({
      rules: 'num:[0,10]',
    }),
  },
  // {
  //   id: 'web',
  //   required: true,
  //   fieldset: 'base_setting',
  //   label: __('Web Template'),
  //   className: 'cols col-6',
  //   type: 'select',
  //   defaultValue: '0',
  //   options: [
  //     {
  //       value: '0',
  //       label: __('Default Web'),
  //     },
  //   ],
  // },
  {
    id: 'list',
    type: 'list',
    className: 'table--base',
    itemVisible: ($$item) => {
      const curId = $$item.get('id');

      return '3,4,7,8'.indexOf(curId) === -1;
    },
    options: [
      {
        id: 'type',
        label: __('Authentication Types'),
        options: [
          {
            value: '0',
            label: __('One Key Authentication'),
          }, {
            value: '1',
            label: __('Accessed User Authentication'),
          }, {
            value: '2',
            label: __('Radius Authentication'),
          }, {
            value: '3',
            label: __('App Authentication'),
          }, {
            value: '4',
            label: __('SMS Authentication'),
          }, {
            value: '5',
            label: __('Wechat Authentication'),
          }, {
            value: '6',
            label: __('Public Platform Authentication'),
          }, {
            value: '7',
            label: __('Visitor Authentication'),
          }, {
            value: '9',
            label: __('Facebook Authentication'),
          },
        ],
        style: {
          textAlign: 'right',
        },
        noForm: true,
      },
      {
        id: 'url',
        label: __('Redirect URL after Authetication'),
        type: 'text',
        validator: validator({
          rules: 'utf8Len:[0, 255]',
        }),
      }, {
        id: 'sessiontime',
        label: __('Limit Connect Duration after Authetication'),
        help: __('minutes(0 means no limitation)'),
        type: 'number',
        min: '0',
        max: '99999',
        validator: validator({
          rules: 'num:[0,99999]',
        }),
      },
    ],
  },
]);

const oneKeyURLOption = fromJS([
  {
    id: 'oneKey_URL',
    label: __('URL After Authentication'),
    type: 'text',
    validator: validator({
      rules: 'utf8Len:[0, 255]',
    }),
  },
]);

export default class View extends React.Component {
  constructor(props) {
    super(props);
    utils.binds(this, [
      'onBeforeSync',
    ]);
  }

  onOneKeyURLModal() {
    this.setState({
      customModal: true,
    });
  }
  render() {
    return (
      <AppScreen
        {...this.props}
        className="port-base"
        settingsFormOptions={settingsOptions}
        onBeforeSync={this.onBeforeSync}
        hasSettingsSaveButton
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
