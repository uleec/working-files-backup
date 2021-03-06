import React from 'react'; import PropTypes from 'prop-types';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import { bindActionCreators } from 'redux';

import { actions as appActions } from 'shared/containers/app';
import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';
import validator from 'shared/validator';

function disabledFunc($$data) {
  let ret;
  switch ($$data.get('xdos_enable')) {
    case '0' : ret = true; break;
    case '1' : ret = false; break;
    default: ret = true;
  }
  return ret;
}

const settingsOptions = fromJS([
  {
    id: 'xdos_enable',
    label: __('Firewall Switch'),
    type: 'checkbox',
    required: true,
  },
  {
    id: 'tcp_syn_dos_enable',
    label: __('TCP-Flood Attack Defense'),
    type: 'checkbox',
    required: true,
    disabled: disabledFunc,
  },
  {
    id: 'tcp_syn_limit_per',
    label: __('Maxium TCP Package Quantity'),
    defaultValue: '10',
    type: 'number',
    required: true,
    validator: validator({
      rules: 'number',
    }),
    disabled: disabledFunc,
  },
  {
    id: 'icmp_echo_dos_enable',
    label: __('ICMP-Flood Attack Defense'),
    type: 'checkbox',
    required: true,
    disabled: disabledFunc,
  },
  {
    id: 'icmp_echo_request_limit_per',
    label: __('Maxium ICMP Package Quantity'),
    defaultValue: '10',
    type: 'number',
    disabled: disabledFunc,
    required: true,
  },
  {
    id: 'udp_limit_dos_enable',
    label: __('UDP-Flood Attack Defense'),
    type: 'checkbox',
    disabled: disabledFunc,
    required: true,
  },
  {
    id: 'udp_limit_per',
    fieldset: 'attackDefense',
    label: __('Maxium UDP Package Quantity'),
    defaultValue: '600',
    type: 'number',
    disabled: disabledFunc,
    required: true,
  },
]);

const propTypes = {
  app: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  save: PropTypes.func,
  fetch: PropTypes.func,
  createModal: PropTypes.func,
  closeModal: PropTypes.func,
  changeModalState: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  render() {
    return (
      <AppScreen
        {...this.props}
        settingsFormOptions={settingsOptions}
        hasSettingsSaveButton
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
