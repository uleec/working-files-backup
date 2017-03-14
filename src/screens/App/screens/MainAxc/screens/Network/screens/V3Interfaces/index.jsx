import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { bindActionCreators } from 'redux';
import validator from 'shared/validator';
import AppScreen from 'shared/components/Template/AppScreen';
import * as screenActions from 'shared/actions/screens';
import * as appActions from 'shared/actions/app';

// function getPortList() {
//   return utils.fetch('goform/network/port')
//     .then(json => (
//       {
//         options: json.data.list.map(
//           item => ({
//             value: item.name,
//             label: `${item.name}`,
//           }),
//         ),
//       }
//     ),
//   );
// }
const $$listOptions = fromJS([
  {
    id: 'index',
    text: _('Index'),
  },
  {
    id: 'status',
    text: _('Status'),
    options: [
      { label: _('UP'), value: 'up' },
      { label: _('OFF'), value: 'off' },
    ],
    formProps: {
      type: 'select',
    },
  },
  {
    id: 'arpAgent',
    text: _('ARP Agent'),
    options: [
      { label: _('ON'), value: 'on' },
      { label: _('OFF'), value: 'off' },
    ],
    formProps: {
      type: 'select',
    },
  },
  {
    id: 'vlanId',
    text: 'VLAN ID',
    formProps: {
      type: 'number',
    },
  },
  {
    id: 'firstIpv4Ip',
    text: _('First IPV4 IP'),
    formProps: {
      type: 'text',
    },
  },
  {
    id: 'firstIpv4Mask',
    text: _('First IPV4 Mask'),
    formProps: {
      type: 'text',
    },
  },
  {
    id: 'secondIpv4Ip',
    text: _('Second IPV4 IP'),
    formProps: {
      type: 'text',
    },
  },
  {
    id: 'secondIpv4Mask',
    text: _('Second IPV4 Mask'),
    formProps: {
      type: 'text',
    },
  },
  {
    id: 'Ipv6Ip',
    text: _('IPV6 IP'),
    formProps: {
      type: 'text',
    },
  },
  {
    id: 'Ipv6Mask',
    text: _('IPV6 Mask'),
    formProps: {
      type: 'text',
    },
  },
  {
    id: 'description',
    text: _('Description'),
    formProps: {
      type: 'text',
    },
  },
]);
const propTypes = {};
const defaultProps = {};


export default class NetworkInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      portOptions: fromJS([]),
      listOptions: $$listOptions,
    };
    // utils.binds(this, [
    //   'onBeforeSync',
    // ]);
  }

  // componentWillMount() {
  //   getPortList()
  //     .then(
  //       (data) => {
  //         this.setState({
  //           listOptions: $$listOptions.setIn(
  //             [0, 'options'],
  //             data.options,
  //           ),
  //         });

  //         return data;
  //       },
  //     );
  // }

  // onBeforeSync($$actionQuery, $$curListItem) {
  //   const { store, route } = this.props;
  //   const actionType = $$actionQuery.get('action');
  //   const ip = $$curListItem.get('ip');
  //   const mask = $$curListItem.get('mask');
  //   let $$curList = store.getIn([route.id, 'data', 'list']);
  //   let ret = '';

  //   if (actionType === 'add' || actionType === 'edit') {
  //     ret = validator.combine.noBroadcastIp(ip, mask);

  //     // 过滤正在编辑的项
  //     if (actionType === 'edit') {
  //       $$curList = $$curList.filter(
  //         $$item => $$item.get('id') !== $$curListItem.get('id'),
  //       );
  //     }

      // 检测是否有相同网段的接口
      // if ($$curList.find(
      //   $$item => validator.combine.noSameSegment(
      //     ip,
      //     mask,
      //     $$item.get('ip'),
      //     $$item.get('mask'),
      //     {
      //       ipLabel: '',
      //       ip1Label: '',
      //     },
      //   ),
      // )) {
      //   ret = _('Same %s item already exists', _('segment'));
      // }
  //   }

  //   return ret;
  // }

  render() {
    return (
      <AppScreen
        {...this.props}
        listOptions={this.state.listOptions}
        onBeforeSync={this.onBeforeSync}
        // editFormId="port"
        listKey="allKeys"
        // maxListSize="24"
        deleteable={($$item, index) => (index !== 0)}
        selectable={($$item, index) => (index !== 0)}
        actionable
      />
    );
  }
}

NetworkInterface.propTypes = propTypes;
NetworkInterface.defaultProps = defaultProps;

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
)(NetworkInterface);