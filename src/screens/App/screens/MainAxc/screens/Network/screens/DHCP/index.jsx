import React, { PropTypes } from 'react';
import utils, { immutableUtils } from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { bindActionCreators } from 'redux';
import validator from 'shared/utils/lib/validator';
import AppScreen from 'shared/components/Template/AppScreen';
import * as screenActions from 'shared/actions/screens';
import * as appActions from 'shared/actions/app';

const listOptions = fromJS([
  {
    id: 'name',
    text: _('Name'),
    formProps: {
      required: true,
      maxLength: '32',
      notEditable: true,
    },
  }, {
    id: 'domain',
    text: _('Domain'),
    formProps: {
      maxLength: '32',
      type: 'text',
    },
  }, {
    id: 'startIp',
    text: _('Start IP'),
    formProps: {
      required: true,
      notEditable: true,
      validator: validator({
        rules: 'ip',
      }),
    },
  }, {
    id: 'mask',
    text: _('Subnet Mask'),
    formProps: {
      required: true,
      notEditable: true,
      validator: validator({
        rules: 'mask',
      }),
    },
  }, {
    id: 'gateway',
    text: _('Gateway'),
    formProps: {
      required: true,
      maxLength: '32',
      validator: validator({
        rules: 'ip',
      }),
    },
  }, {
    id: 'mainDns',
    text: _('Primary DNS'),
    formProps: {
      maxLength: '32',
      validator: validator({
        rules: 'ip',
      }),
    },
  }, {
    id: 'secondDns',
    text: _('Secondary DNS'),
    formProps: {
      validator: validator({
        rules: 'ip',
      }),
    },
  }, {
    id: 'releaseTime',
    text: _('Lease Time'),
    formProps: {
      type: 'number',
      required: true,
      help: _('Range:300-604800Second'),
      min: '300',
      max: '604800',
      validator: validator({
        rules: 'num[300,604800]',
      }),
    },
  }, {
    id: 'opt43',
    text: _('AC Address'),
    noTable: true,
    formProps: {
      type: 'text',
      validator: validator({
        rules: 'iplist:[";"]',
      }),
    },
  }, {
    id: 'opt60',
    text: _('Vendor ID'),
    noTable: true,
    formProps: {
      type: 'number',
      max: '32',
      min: '1',
      validator: validator({
        rules: 'num[1,32]',
      }),
    },
  },
]);
const editFormOptions = immutableUtils.getFormOptions(listOptions);
const propTypes = {
  route: PropTypes.object,
  save: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);

    this.onBeforeSave = this.onBeforeSave.bind(this);
  }

  onBeforeSave($$actionQuery, $$curListItem) {
    const actionType = $$actionQuery.get('action');
    let ret = '';

    if (actionType === 'add' || actionType === 'edit') {
      ret = '';
    }

    return ret;
  }

  render() {
    return (
      <AppScreen
        {...this.props}
        listOptions={listOptions}
        editFormOptions={editFormOptions}
        onBeforeSave={this.onBeforeSave}
        listKey="name"
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
