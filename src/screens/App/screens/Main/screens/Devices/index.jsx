import React from 'react';
import utils from 'utils';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { bindActionCreators } from 'redux'
import * as actions from './actions';
import * as validateActions from 'actions/valid';
import reducer from './reducer';
import {fromJS, Map} from 'immutable';
import validator from 'utils/lib/validator';

import {Table} from 'components/Table';
import {Search, FormGroup, Checkbox} from 'components/Form';
import Button from 'components/Button';
import Select from 'components/Select';
import Modal from 'components/Modal';
import Switchs from 'components/Switchs';

// css
import './_index.scss';

/**
 *
 */
const typeArr = [
  {
    value: '0',
    label: _('All')
  }, {
    value: '1',
    label: _('INSIDE')
  }, {
    value: '3',
    label: _('OUTSIDE')
  }, {
    value: '4',
    label: _('IN OPERATION...')
  }
];

const labelPre = _('Items per page: ');

const validOptions = Map({
  ip: validator({
    rules: 'ip'
  }),

  mask: validator({
    rules: 'mask'
  }),

  gateway: validator({
    rules: 'ip'
  }),

  main_dns: validator({
    rules: 'dns'
  }),

  second_dns: validator({
    rules: 'dns'
  })
});

const selectOptions = [
  { value: 20, label: labelPre + '20' },
  { value: 50, label: labelPre + '50' },
  { value: 100, label: labelPre + '100' },
];

// 原生的 react 页面
export const Device = React.createClass({
  mixins: [PureRenderMixin],

  componentWillMount() {
    this.handleSearch()
  },
  
  componentDidUpdate(prevProps) {
    if(prevProps.app.get('refreshAt') !== this.props.app.get('refreshAt')) {
      this.handleSearch();
    }
  },
  
  componentWillUnmount() {
    this.props.resetVaildateMsg();
    this.props.leaveDevicesScreen();
  },

  handleSearch() {
    this.props.fetchDevices('/goform/devices');
  },

  /**
   * action: reboot | reset | locate
   */
  handleAction(mac, action) {
    const data = {
      action,
      macs: [
        mac
      ]
    }

    this.props.saveDevicesAction(data)
  },

  // on Query changed
  onChangeSearchText(val) {
    this.props.changeDevicesQuery({
      search: val
    });
  },
  onChangeTableSize(option) {
    this.props.changeDevicesQuery({
      size: option.value,
      page: 1
    });
    this.handleSearch()
  },
  onChangeDevicesQuery(data) {
    this.props.changeDevicesQuery({
      devicetype: data.value
    });
    this.handleSearch()
  },
  onPageChange(i) {
    this.props.changeDevicesQuery({
      page: i
    });
    this.handleSearch()
  },

  /**
   * 
   */
  onResetDevice(mac) {
    var msg_text = _('Are you sure reset device: %s?', mac);

    if (confirm(msg_text)) {
      this.handleAction(mac, 'reset');
    }
  },
  onRebootDevice(mac) {
    var msg_text = _('Are you sure reboot device: %s?', mac);

    if (confirm(msg_text)) {
      this.handleAction(mac, 'reboot');
    }
  },
  onLocateDevice(mac) {
    
    this.handleAction(mac, 'locate');
  },
  onUpgradeDevice(mac) {
    var msg_text = _('Upgrade need reboot Device, are you sure upgrade device: %s?', mac);
    
    if (confirm(msg_text)) {
      this.handleAction(mac, 'upgrade');
    }
  },

  // onEdit
  showEditNetwork(mac) {

    return function (e) {
      this.props.fetchDeviceNetwork(mac)
    }.bind(this);
  },
  onChangeDeviceNetwork(name) {
    return function (data) {
      var editObj = {};

      editObj[name] = data.value;
      this.props.changeDeviceNetwork(editObj);
    }.bind(this)
  },

  // 组合验证
  combineValid() {
    const {ip, mask, gateway, connect_type} = this.props.store.get('edit').toJS();
    var ret;

    if (connect_type === 'static') {
      ret = validator.combineValid.staticIP(ip, mask, gateway);
    }

    return ret;
  },

  onSaveDeviceNetWork() {

    this.props.validateAll(function (invalid) {
      let combineValidResult = this.combineValid();

      if (invalid.isEmpty()) {
        if (combineValidResult) {
          alert(combineValidResult)
        } else {
          this.props.saveDeviceNetwork();
        }

      } else {
        console.log(invalid.toJS())
      }
    }.bind(this));

  },

  getDevicesTableOptions() {
    let ret = '';
    if (this.props.store.getIn(['query', 'devicetype']) === '4') {
      ret = fromJS([
          {
            id: 'devicename',
            text: _('MAC Address') + '/' + _('Name'),
            transform: function (val, item) {
              var deviceMac = item.get('mac');

              return val || deviceMac;
            }
          }, {
            id: 'model',
            text: _('Model')
          }, {
            id: 'softversion',
            text: _('Version')
          }, {
            id: 'operationhours',
            text: _('Uptime'),
            filter: 'connectTime',
          }, {
            id: 'operate',
            text: _('Action'),
            filter: 'translate'
          }
      ]);

    } else {
      ret = fromJS([
        {
          id: 'devicename',
          text: _('MAC Address') + '/' + _('Name'),
          transform: function (val, item) {
            var deviceMac = item.get('mac');
            var name = item.get('devicename') || deviceMac;
            var deviceStatus = item.get('status');

            if (deviceStatus === 'disable') {
              return <span>{name}</span>
            }

            return (
              <span
                className="link-text"
                onClick={this.showEditNetwork(deviceMac) }
                value={deviceMac}
                title={_('MAC Address') + ': ' + deviceMac}
                >
                {name}
              </span>
            )
          }.bind(this)
        }, {
          id: 'ip',
          text: _('IP Address'),
          transform: function (val, item) {
            var deviceMac = item.get('mac');
            var deviceStatus = item.get('status');

            if (deviceStatus === 'disable') {
              return <span>{item.get('ip') }</span>
            }

            return (
              <span
                className="link-text"
                onClick={this.showEditNetwork(deviceMac) }
                value={deviceMac}
                >
                {item.get('ip') }
              </span>
            )
          }.bind(this)
        }, {
          id: 'status',
          text: _('Status'),
          filter: 'translate'
        }, {
          id: 'model',
          text: _('Model')
        }, {
          id: 'softversion',
          text: _('Version')
        }, {
          id: 'operationhours',
          text: _('Uptime'),
          filter: 'connectTime',
        }, {
          id: 'op',
          text: _('Actions'),
          width: '360',
          transform: function (val, item) {
            var deviceMac = item.get('mac');
            var deviceStatus = item.get('status');
            var upgradeBtn = null;

            if (deviceStatus === 'disable' || this.p) {
              return null;
            }

            if (item.get('newest') === '0') {
              upgradeBtn = <Button
                onClick={this.onUpgradeDevice.bind(this, deviceMac) }
                text={_('Upgrade') }
                size="sm"
                icon="level-up"
                />;
            }

            return (
              <div className="action-btns">
                <Button
                  onClick={this.onRebootDevice.bind(this, deviceMac) }
                  text={_('Reboot') }
                  size="sm"
                  icon="recycle"
                  />
                <Button
                  onClick={this.onLocateDevice.bind(this, deviceMac) }
                  text={_('Locate') }
                  size="sm"
                  icon="location-arrow"
                  />
                <Button
                  onClick={this.onResetDevice.bind(this, deviceMac) }
                  text={_('Reset') }
                  size="sm"
                  icon="reply-all"
                  />
                {upgradeBtn}
              </div>
            )
          }.bind(this)
        }]);
    }
    
    return ret;
  },

  render() {
    const devicesTableOptions = this.getDevicesTableOptions();
    const typeOptions = fromJS([
      {
        value: 'dhcp',
        label: 'DHCP'
      }, {
        value: 'static',
        label: _('Static IP')
      }
    ]);
    const currData = this.props.store.get('edit') || Map({});
    const {ip, mask, gateway, main_dns, second_dns} = this.props.validateOption;
    const { text, devicetype, size } = this.props.store.get('query').toJS();

    return (
      <div className="page-device">
        <h2>{_('Devices Info') }</h2>
        <div className="clearfix">
          <Search
            className="search fl"
            value={text}
            placeholder={_('IP or MAC Address')}
            onChange={this.onChangeSearchText}
            onSearch={this.handleSearch}
          />

          <Switchs
            options={typeArr}
            value={devicetype}
            onChange={this.onChangeDevicesQuery}
          />

          <Select
            className="fr"
            clearable={false}
            value={size}
            onChange={this.onChangeTableSize}
            options={selectOptions}
          />
        </div>

        <Table
          className="table"
          loading={this.props.store.get('fetching')}
          options={devicesTableOptions}
          list={this.props.store.getIn(['data', 'list']) }
          page={this.props.store.getIn(['data', 'page']) }
          onPageChange={this.onPageChange}
        />

        <Modal
          isShow={currData.isEmpty() ? false : true}
          title={currData.get('mac') }
          onClose={this.props.closeDeviceEdit}
          onOk={this.onSaveDeviceNetWork}
          >
          <FormGroup
            label={_('Nickname') }
            maxLength="24"
            value={currData.get('nickname') }
            onChange={this.onChangeDeviceNetwork('nickname') }
          />

          <div className="form-group">
            <label htmlFor="">{_('Connect Type') }</label>
            <div className="form-control">
              <Switchs
                options={typeOptions}
                clearable={false}
                onChange={this.onChangeDeviceNetwork('connect_type') }
                value={currData.get('connect_type') }
              />
            </div>
          </div>
          {
            currData.get('connect_type') === 'static' ? (
              <div>
                <FormGroup
                  label={_('Static IP') }
                  required={true}
                  maxLength="15"
                  value={currData.get('ip') }
                  onChange={this.onChangeDeviceNetwork('ip') }

                  {...ip}
                />

                <FormGroup
                  {...mask}
                  label={_('Subnet Mask') }
                  required={true}
                  maxLength="15"
                  value={currData.get('mask') }
                  onChange={this.onChangeDeviceNetwork('mask') }
                />

                <FormGroup
                  label={_('Default Gateway') }
                  required={true}
                  maxLength="15"
                  value={currData.get('gateway') }
                  onChange={this.onChangeDeviceNetwork('gateway') }
                  {...gateway}
                />
                <FormGroup
                  label={_('DNS 1') }
                  maxLength="15"
                  value={currData.get('main_dns') }
                  onChange={this.onChangeDeviceNetwork('main_dns') }
                  {...main_dns}
                />
                <FormGroup
                  label={_('DNS 2') }
                  maxLength="15"
                  value={currData.get('second_dns') }
                  onChange={this.onChangeDeviceNetwork('second_dns') }
                  {...second_dns}
                />
              </div>
            ) : null
          }

        </Modal>
      </div>
    );
  }
});

function mapStateToProps(state) {

  return {
    store: state.devices,
    app: state.app
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    validateActions,
    actions
  ), dispatch)
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions)
)(Device);

export const devices = reducer;

