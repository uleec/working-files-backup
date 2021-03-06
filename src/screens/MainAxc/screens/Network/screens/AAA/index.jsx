import React from 'react'; import PropTypes from 'prop-types';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { bindActionCreators } from 'redux';

import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';
import { actions as appActions } from 'shared/containers/app';
import validator from 'shared/validator';

function getInterfaceTypeOptions() {
  return utils.fetch('goform/network/radius/template')
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
const accessTypeSeletOptions = [
  {
    value: 'portal',
    label: __('Portal'),
  },
  {
    value: '8021x-access',
    label: __('802.1x'),
    disabled: true,
  },
  // {
  //   value: 'lan-access',
  //   label: __('LAN'),
  //   disabled: true,
  // }, {
  //   value: 'ppp-access',
  //   label: __('PPP'),
  //   disabled: true,
  // }, {
  //   value: 'mac-access',
  //   label: __('MAC'),
  //   disabled: true,
  // },
];

const authTypeSeletOptions = [
  // {
  //   value: 'local',
  //   label: `${__('Local')}`,
  //   disabled: true,
  // },
  {
    value: 'radius-scheme',
    label: `${__('External')}`,
  },
];

// 大于2.5版本
if (window.guiConfig.versionCode >= 20500) {
  // 开启 802.1x
  accessTypeSeletOptions[1].disabled = false;
}

const listOptions = fromJS([
  {
    id: 'domain_name',
    text: __('Name'),
    defaultValue: '',
    notEditable: true,
    formProps: {
      type: 'text',
      required: true,
      maxLength: '31',
      validator: validator({
        rules: 'utf8Len:[1,31]',
      }),
    },
  }, {
    id: 'radius_template',
    text: __('Radius Template'),
    formProps: {
      label: __('Radius Template'),
      required: true,
      type: 'select',
      placeholder: __('Please Select ') + __('Radius Template'),
      options: [],
    },
  }, {
    id: 'auth_accesstype',
    text: __('Authentication Type'),
    defaultValue: 'portal',
    options: accessTypeSeletOptions,
    formProps: {
      label: __('Authentication Type'),
      required: true,
      type: 'switch',
    },
  }, {
    id: 'auth_schemetype',
    text: __('Type'),
    defaultValue: 'radius-scheme',
    options: authTypeSeletOptions,
    formProps: {
      label: __('Type'),
      required: true,
      type: 'switch',
      placeholder: __('Please Select ') + __('Rules Group'),
    },
  },
]);
const propTypes = {
  route: PropTypes.object,
  save: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);

    this.onAction = this.onAction.bind(this);
    this.state = {
      radiusOptions: [],
    };
  }

  componentWillMount() {
    getInterfaceTypeOptions().then(
      (data) => {
        this.setState({
          radiusOptions: data.options,
        });
      },
    );
  }

  onAction(no, type) {
    const query = {
      no,
      type,
    };

    this.props.save(this.props.route.formUrl, query)
      .then((json) => {
        if (json.state && json.state.code === 2000) {
        }
      });
  }

  render() {
    const myListOptions = listOptions.setIn(
      [1, 'formProps', 'options'],
      this.state.radiusOptions,
    );
    return (
      <AppScreen
        {...this.props}
        listKey="domain_name"
        listOptions={myListOptions}
        deleteable={
          ($$item, index) => (index !== 0)
        }
        maxListSize="16"
        actionable
        selectable
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
