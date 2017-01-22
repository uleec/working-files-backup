import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import validator from 'shared/utils/lib/validator';
import { bindActionCreators } from 'redux';
import AppScreen from 'shared/components/Template/AppScreen';
import * as appActions from 'shared/actions/app';
import * as screenActions from 'shared/actions/screens';

function getPortList() {
  return utils.fetch('goform/network/portal/rule')
    .then(json => (
      {
        options: json.data.list.map(
          item => ({
            value: item.interface_bind,
            label: item.interface_bind,
            serverName: item.template_name,
          }),
        ),
      }
    ),
  );
}
const listOptions = fromJS([
  {
    id: 'interface_bind',
    label: _('Port'),
    formProps: {
      type: 'select',
      required: true,
      notEditable: true,
    },
  }, {
    id: 'src_mac',
    label: _('Mac White List'),
    formProps: {
      type: 'text',
      maxLength: '31',
      required: true,
      validator: validator({
        rules: 'mac',
      }),
    },
  },
]);

const propTypes = {
  store: PropTypes.instanceOf(Map),
  updateCurEditListItem: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      portOptions: fromJS([]),
    };
    utils.binds(this, [
      'onBeforeSave',
    ]);
  }
  componentWillMount() {
    getPortList()
      .then((data) => {
        this.setState({
          portOptions: fromJS(data.options),
        });
      });
  }

  onBeforeSave($$actionQuery, $$curListItem) {
    const actionType = $$actionQuery.getIn(['action']);
    const interfaceBind = $$curListItem.get('interface_bind');
    let serverName = '';

    if (actionType === 'add' || actionType === 'delete') {
      serverName = this.state.portOptions.find(
        $$item => $$item.get('value') === interfaceBind,
      ).get('serverName');

      this.props.updateCurEditListItem({
        template_name: serverName,
      });
    }
  }

  render() {
    const { store } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    const curListOptions = listOptions
      .setIn([0, 'options'], this.state.portOptions);

    return (
      <AppScreen
        {...this.props}
        store={store}
        listOptions={curListOptions}
        onBeforeSave={this.onBeforeSave}
        actionable
        selectable
        editable={false}
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
