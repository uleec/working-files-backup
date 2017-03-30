import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { bindActionCreators } from 'redux';
import validator from 'shared/validator';
import AppScreen from 'shared/components/Template/AppScreen';
import { actions as screenActions } from 'shared/containers/appScreen';
import { actions as appActions } from 'shared/containers/app';

const listOptions = fromJS([
  {
    id: 'name',
    text: __('Name'),
    formProps: {
      type: 'text',
      required: true,
    },
  },
  {
    id: 'aid',
    text: __('Ads'),
    formProps: {
      type: 'select',
      required: true,
    },
  },
  {
    id: 'pos',
    text: __('Sorting'),
    formProps: {
      type: 'text',
      required: true,
    },
  },
  {
    id: 'url',
    text: __('URL'),
    noTable: true,
    formProps: {
      type: 'text',
      required: true,
    },
  },
  {
    id: 'img',
    text: __('Adv Pitcture'),
    formProps: {
      type: 'file',
      required: true,
    },
  },
  {
    id: 'imgW',
    text: __('Adv Big Pitcture'),
    formProps: {
      type: 'file',
      required: true,
    },
  },
  {
    id: 'uid',
    text: __('User'),
    noForm: true,
    formProps: {
      type: 'text',
      required: true,
    },
  },
  {
    id: 'sid',
    text: __('Store Name'),
    noForm: true,
    formProps: {
      type: 'text',
      required: true,
    },
  },
  {
    id: 'showCount',
    text: __('Show Count'),
    formProps: {
      type: 'number',
      required: true,
    },
  },
  {
    id: 'clickCount',
    text: __('Click Count'),
    formProps: {
      type: 'number',
      required: true,
    },
  },

]);

const propTypes = {};
const defaultProps = {};

export default class AdvStores extends React.Component {
  render() {
    return (
      <AppScreen
        {...this.props}
        listOptions={listOptions}
        editFormOption={{
          hasFile: true,
        }}
        actionable
        selectable
      />
    );
  }
}

AdvStores.propTypes = propTypes;
AdvStores.defaultProps = defaultProps;

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
)(AdvStores);