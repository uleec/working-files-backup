import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import validator from 'shared/validator';
import AppScreen from 'shared/components/Template/AppScreen';
import * as screenActions from 'shared/actions/screens';
import * as appActions from 'shared/actions/app';

const onlinetimeFilter = utils.filter('connectTime');

const listOptions = fromJS([
  {
    id: 'nasip',
    text: _('Nas IP'),
    type: 'text',
    formProps: {
      required: true,
      validator: validator({
        rules: 'ip',
      }),
    },
  }, {
    id: 'sourceip',
    text: _('Source IP'),
    type: 'text',
    formProps: {
      required: true,
    },
  }, {
    id: 'userip',
    text: _('User IP'),
    formProps: {
      required: true,
    },
  }, {
    id: 'callingstationid',
    text: _('Mac'),
    formProps: {
      required: true,
    },
  }, {
    id: 'name',
    text: _('Login Name'),
    formProps: {
      required: true,
    },
  }, {
    id: 'state',
    text: _('Acc Type'),
    formProps: {
      type: 'select',
      required: true,
    },
    options: [
      {
        value: '0',
        label: _('Unavailability'),
      }, {
        value: '1',
        label: _('Free of Charge'),
      },
      {
        value: '2',
        label: _('Timekeeping'),
      }, {
        value: '3',
        label: _('Buy Out'),
      }, {
        value: '4',
        label: _('Traffic'),
      }, {
        value: '-1',
        label: _('Outside User'),
      },
    ],
  }, {
    id: 'startDate',
    text: _('Online Date'),
    type: 'text',
  }, {
    id: 'endDate',
    text: _('Offline Date'),
    type: 'text',
    required: true,
  }, {
    id: 'time',
    text: _('Time'),
    formProps: {
      required: true,
    },
    transform(val) {
      return onlinetimeFilter.transform(val / 1000);
    },
  }, {
    id: 'ins',
    text: _('Up Traffic'),
    formProps: {
      required: true,
    },
  }, {
    id: 'outs',
    text: _('Down Traffic'),
    formProps: {
      required: true,
    },
  }, {
    id: 'octets',
    text: _('Used Traffic'),
    formProps: {
      required: true,
    },
  }, {
    id: 'acctsessionid',
    text: _('Acc ID'),
    noTable: true,
    formProps: {
      required: true,
    },
  }, {
    id: 'ex1',
    text: _('NAS Type'),
    noTable: true,
    formProps: {
      required: true,
    },
  }, {
    id: 'ex2',
    text: _('Reason'),
    formProps: {
      required: true,
    },
  },
]);
const propTypes = {
  route: PropTypes.object,
  save: PropTypes.func,
};
const defaultProps = {};

export default class OpenPortalBase extends React.Component {
  constructor(props) {
    super(props);

    this.onAction = this.onAction.bind(this);
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
    return (
      <AppScreen
        {...this.props}
        listOptions={listOptions}
        actionable
        selectable
        addable={false}
        editable={false}
      />
    );
  }
}

OpenPortalBase.propTypes = propTypes;
OpenPortalBase.defaultProps = defaultProps;

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
)(OpenPortalBase);
