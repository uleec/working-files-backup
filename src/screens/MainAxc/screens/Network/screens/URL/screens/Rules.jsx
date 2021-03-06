import React from 'react'; import PropTypes from 'prop-types';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import {
  Modal, Table, Select, EchartReact, Button, FormGroup,
} from 'shared/components';
import { actions as appActions } from 'shared/containers/app';
import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';
import Icon from 'shared/components/Icon';


const propTypes = {
  screenStore: PropTypes.instanceOf(Map),
};
const defaultProps = {};

export default class Rules extends React.Component {
  render() {
    const { screenStore } = this.props;
    return (
      <AppScreen
        {...this.props}
        store={screenStore}
      >
        <div>

        </div>
      </AppScreen>
    );
  }
}

Rules.propTypes = propTypes;
Rules.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    screenStore: state.screens,
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
)(Rules);
