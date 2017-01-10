import React, { PropTypes } from 'react';
import utils, { immutableUtils } from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import AppScreen from 'shared/components/Template/AppScreen';
import * as appActions from 'shared/actions/app';
import * as screenActions from 'shared/actions/screens';

const settingsFormOptions = fromJS([
  {
    id: 'widsenable',
    text: _('Enable'),
    type: 'checkbox',
    dataType: 'number',
    defaultValue: '0',
  }, {
    id: 'attacttime',
    label: _('Harass Attact Time'),
    min: 1,
    type: 'number',
    dataType: 'number',
    defaultValue: 1,
    help: _('Seconds'),
  }, {
    id: 'attactcnt',
    label: _('Harass Number'),
    min: 1,
    type: 'number',
    dataType: 'number',
    defaultValue: 1,
  }, {
    id: 'dyaging',
    label: _('Release Time'),
    legend: _('Dynamic Blacklists'),
    fieldset: 'Dynamic',
    min: 1,
    type: 'number',
    dataType: 'number',
    defaultValue: 3600,
    help: _('Seconds'),
  },
]);


const propTypes = {
  selectedGroup: PropTypes.instanceOf(Map),
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.actionable = this.props.selectedGroup.get('aclType') === 'black';
    this.settingsFormOptions = settingsFormOptions;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedGroup !== this.props.selectedGroup) {
      this.actionable = nextProps.selectedGroup.get('aclType') === 'black';

      // 不可操作需隐藏开关按钮
      if (!this.actionable) {
        this.settingsFormOptions = settingsFormOptions.filterNot(
          $$item => $$item.get('id') === 'widsenable'
        );
      } else {
        this.settingsFormOptions = settingsFormOptions;
      }
    }
  }

  render() {
    return (
      <AppScreen
        {...this.props}
        settingsFormOptions={this.settingsFormOptions}
        hasSettingsSaveButton={this.actionable}
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
    groupid: state.product.getIn(['group', 'selected', 'id']),
    selectedGroup: state.product.getIn(['group', 'selected']),
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
