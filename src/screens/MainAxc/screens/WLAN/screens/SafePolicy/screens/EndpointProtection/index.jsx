import React from 'react'; import PropTypes from 'prop-types';
import utils, { immutableUtils } from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';

import { actions as appActions } from 'shared/containers/app';
import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';

const settingsFormOptions = fromJS([
  {
    id: 'widsenable',
    text: __('Enable'),
    type: 'checkbox',
    dataType: 'number',
    defaultValue: '0',
  }, {
    id: 'attacttime',
    label: __('Harass Attack Time'),
    min: 1,
    type: 'number',
    dataType: 'number',
    defaultValue: 1,
    help: __('Seconds'),
  }, {
    id: 'attactcnt',
    label: __('Harass Number'),
    min: 1,
    type: 'number',
    dataType: 'number',
    defaultValue: 1,
  }, {
    id: 'dyaging',
    label: __('Release Time'),
    legend: __('Dynamic Blacklists'),
    fieldset: 'Dynamic',
    min: 1,
    type: 'number',
    dataType: 'number',
    defaultValue: 3600,
    help: __('Seconds'),
  },
]);


const propTypes = {
  selectedGroup: PropTypes.instanceOf(Map),
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
    utils.binds(this, [
      'initOptions',
    ]);
  }

  componentWillMount() {
    this.initOptions(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedGroup !== this.props.selectedGroup) {
      this.initOptions(nextProps);
    }
  }

  initOptions(props) {
    this.actionable = props.selectedGroup.get('aclType') === 'black';
    // 不可操作需隐藏开关按钮
    if (!this.actionable) {
      this.settingsFormOptions = settingsFormOptions.filterNot(
        $$item => $$item.get('id') === 'widsenable',
      );
    } else {
      this.settingsFormOptions = settingsFormOptions;
    }
  }

  render() {
    return (
      <AppScreen
        {...this.props}
        settingsFormOptions={this.settingsFormOptions}
        actionable={this.actionable}
        hasSettingsSaveButton={this.actionable}
        noTitle
      >
        {
          !this.actionable && (
          <div style={{ margin: '30px 30px', fontSize: '14px' }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px', color: 'red' }}>{__('Notice:')}</span>
            <span style={{ marginRight: '10px' }}>{__('The activation of functions here needs the Black List to be actived first')}</span>
            <span style={{ marginRight: '10px' }}><a href="#/main/group/acl"><i>{__('Go to Black List page')}</i></a></span>
          </div>
          )
        }
      </AppScreen>
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
