import React from 'react'; import PropTypes from 'prop-types';
import utils from 'shared/utils';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  SaveButton, FormGroup, FormInput,
} from 'shared/components';
import validator from 'shared/validator';
import { actions as appActions } from 'shared/containers/app';
import { actions as sharedActions } from 'shared/containers/settings';
import Modal from 'shared/components/Modal';
import ProgressBar from 'shared/components/ProgressBar';
import * as selfActions from './actions';
import reducer from './reducer';

const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  selfState: PropTypes.instanceOf(Map),
  // route: PropTypes.object,
  // initSettings: PropTypes.func,
  // fetchSettings: PropTypes.func,
  saveSettings: PropTypes.func,
  updateItemSettings: PropTypes.func,
  // leaveSettingsScreen: PropTypes.func,
  validateOption: PropTypes.object,
  validateAll: PropTypes.func,
  route: PropTypes.object,
  changeProgressModalShowStatus: PropTypes.func,
};

const defaultProps = {};

const validOptions = Map({
  lanIp: validator({
    rules: 'ip',
  }),
  lanMask: validator({
    rules: 'mask',
  }),
  firstDNS: validator({
    rules: 'ip',
  }),
  secondDNS: validator({
    rules: 'ip',
  }),
  validGateway: validator({
    rules: 'ip',
  }),
  validSsid: validator({
    rules: 'remarkTxt:["\'\\\\"]|len:[1, 31]',
  }),
  validDistance: validator({
    rules: 'num:[1, 10]',
  }),
  validPassword: validator({
    rules: 'pwd|len:[8, 32]',
  }),
  apmac2: validator({
    rules: 'mac',
  }),
  apmac3: validator({
    rules: 'mac',
  }),
  validVlanId1: validator({
    rules: 'num:[1, 4094]',
  }),
  validVlanId2: validator({
    rules: 'num:[1, 4094]',
  }),
});



export default class NetworkSettings extends React.Component {

  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.onDhcpClick = this.onDhcpClick.bind(this);
    this.onStaticClick = this.onStaticClick.bind(this);
    // this.onVlanBtnClick = this.onVlanBtnClick.bind(this);
    this.noErrorThisPage = this.noErrorThisPage.bind(this);
    this.firstInAndRefresh = this.firstInAndRefresh.bind(this);
    this.updateItemInRouterInfo = this.updateItemInRouterInfo.bind(this);
    this.apMode = '0';
  }

  componentWillMount() {
    this.props.fetch('goform/get_firstLogin_info')
        .then((json) => {
          if (json.state && json.state.code === 2000) {
            this.apMode = json.data.enable;
          }
        });
    this.firstInAndRefresh();
  }

  componentDidUpdate(prevProps) {
    if (this.props.app.get('refreshAt') !== prevProps.app.get('refreshAt')) {
      this.firstInAndRefresh();
      this.props.resetVaildateMsg();
    }
  }

  onSave() {
    const that = this;
    const { ip, mask, gateway, dns1, dns2, proto } = this.props.store.get('curData').toJS();
    let msg;
    function showError(_msg) {
      that.props.createModal({
        id: 'settings',
        role: 'alert',
        text: _msg,
      });
    }
    this.props.validateAll()
      .then((mg) => {
        if (mg.isEmpty()) {
          if (proto === 'static') {
            if (ip !== '' && typeof (ip) !== 'undefined' && mask !== '' && typeof (mask) !== 'undefined') {
              msg = validator.combine.noBroadcastIp(ip, mask);
              if (msg) {
                showError(msg);
                return;
              }
            }
            if (gateway !== '' && typeof (gateway) !== 'undefined' && mask !== '' && typeof (mask) !== 'undefined') {
              msg = validator.combine.noBroadcastIp(gateway, mask);
              if (proto === 'static' && msg) {
                showError(__('Gateway can not be broadcast IP address!'));
                return;
              }
            }
            if (ip !== '' && typeof (ip) !== 'undefined' &&
                mask !== '' && typeof (mask) !== 'undefined' &&
                gateway !== '' && typeof (gateway) !== 'undefined') {
              msg = validator.combine.needStaticIP(ip, mask, gateway);
              if (proto === 'static' && gateway !== '' && msg) {
                showError(msg);
                return;
              }
            }
            msg = __('Primary and Secondary DNS can not be the same !');
            if (dns1 !== '' && typeof (dns1) !== 'undefined' &&
                dns2 !== '' && typeof (dns2) !== 'undefined' &&
                validator.combine.notEqual(dns1, dns2, msg)) {
              showError(msg);
              return;
            }
          }
          this.props.saveSettings();
          this.props.changeProgressModalShowStatus(true);
        }
      });
  }

  onDhcpClick() {
    const val = this.props.store.getIn(['curData', 'proto']);
    if (val === 'static') {
      this.props.updateItemSettings({
        proto: 'dhcp',
      });
    }
  }

  onStaticClick() {
    const val = this.props.store.getIn(['curData', 'proto']);
    if (val === 'dhcp') {
      this.props.updateItemSettings({
        proto: 'static',
      });
    }
  }

  firstInAndRefresh() {
    const props = this.props;
    const groupId = props.groupId || -1;
    props.initSettings({
      settingId: props.route.id,
      formUrl: props.route.formUrl,
      saveUrl: props.route.saveUrl,
      query: {
        groupId,
      },
      defaultData: {
        proto: 'dhcp', // static or dhcp
        // fallbackIp: '192.168.1.11', // fallback ip
        // fallbackMask: '255.255.255.0',
        // ip: '192.168.1.10',
        // mask: '255.255.255.0',
        // gateway: '192.168.1.1',
        // dns1: '192.168.1.1', // 主dns
        // dns2: '8.8.8.8', // 次dns
        // mtu: '1500',
        vlanEnable: '1',  // 管理vlan开关,默认关
        vlanId: '1', // 2-4094 // vlan id
      },
    });
    props.fetchSettings();
  }

  noErrorThisPage(...args) {
    const errorMsg = this.props.app.get('invalid');
    let flag = true;
    if (errorMsg.isEmpty()) {
      return true;
    }
    for (const name of args) {
      if (errorMsg.has(name)) {
        flag = false;
      }
    }
    return flag;
  }

  updateItemInRouterInfo(name, value) {
    const routerInfo = this.props.store.getIn(['curData', 'routerInfo']).set(name, value);
    this.props.updateItemSettings({ routerInfo });
  }

  render() {
    const store = this.props.store;
    const {
      proto, fallbackIp, ip, mask, gateway, dns1, dns2, networkMode,
      mngVlanId, utgVlanId, fallbackMask, vlanEnable,
    } = this.props.store.get('curData').toJS();
    const {
      lanIp, lanMask, firstDNS, secondDNS, validGateway, validVlanId1, validVlanId2,
    } = this.props.validateOption;
    const funConfig = this.props.route.funConfig;
    const nextIpAddr = this.props.store.getIn(['curData', 'ip']);
    return (
      <div>
        <Modal
          isShow={this.props.selfState.get('showProgressModal')}
          cancelButton={false}
          noFooter={false}
          okButton={false}
          draggable
          title={__('The configuration is saving now, please wait...')}
        >
          <ProgressBar
            isShow
            start
            time={60}
            step={600}
            callback={() => {
              const nextProto = this.props.store.getIn(['curData', 'proto']);
              if (this.curProto === nextProto && this.curProto === 'dhcp') {
                window.location = '#';
              } else {
                window.location = nextProto === 'dhcp' ? 'http://192.168.188.1' : `http://${nextIpAddr}`;
              }
            }}
          />
        </Modal>
        {
          funConfig.router ? (
            // 网络设置，有router模式
            <div>
              <h3>{__('LAN/WAN Settings')}</h3>
              <FormGroup
                label={__('Device Mode')}
              >
                <div
                  style={{
                    marginTop: '8px',
                  }}
                >
                  <FormInput
                    type="radio"
                    name="networkmode"
                    text={__('Switch Mode')}
                    checked={networkMode === 'switch'}
                    onChange={() => {
                      this.props.updateItemSettings({ networkMode: 'switch' });
                    }}
                  />&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormInput
                    type="radio"
                    name="networkmode"
                    text={__('Router Mode')}
                    checked={networkMode === 'router'}
                    onChange={() => {
                      this.props.updateItemSettings({ networkMode: 'router' });
                    }}
                  />
                </div>
              </FormGroup>
            </div>
          ) : (
            <div>
              <h3>{__('LAN Settings')}</h3>
            </div>
          )
        }

        {
          networkMode === 'switch' || !networkMode ? (
            <div>
              <FormGroup
                type="select"
                label={__('LAN IP Mode')}
                options={[
                  { value: 'dhcp', label: __('DHCP') },
                  { value: 'static', label: __('Static') },
                ]}
                minWidth="100px"
                value={proto}
                onChange={(data) => {
                  this.props.updateItemSettings({ proto: data.value });
                }}
              />
              {
                (proto === 'dhcp') ? (
                  <div>
                    <FormGroup
                      type="text"
                      label={__('Fallback IP')}
                      value={fallbackIp}
                      disabled
                    />
                    <FormGroup
                      type="text"
                      label={__('Fallback Netmask')}
                      value={fallbackMask}
                      disabled
                    />
                  </div>
                ) : (
                  <div>
                    <FormGroup
                      type="text"
                      label={__('IP Address')}
                      value={ip || ''}
                      onChange={data => this.props.updateItemSettings({
                        ip: data.value,
                      })}
                      required
                      {...lanIp}
                    />
                    <FormGroup
                      type="text"
                      label={__('Subnet Mask')}
                      value={mask || ''}
                      onChange={data => this.props.updateItemSettings({
                        mask: data.value,
                      })}
                      required
                      {...lanMask}
                    />
                    <FormGroup
                      type="text"
                      label={__('Gateway')}
                      value={gateway}
                      onChange={data => this.props.updateItemSettings({
                        gateway: data.value,
                      })}
                      {...validGateway}
                    />
                    <FormGroup
                      type="text"
                      label={__('Primary DNS')}
                      value={dns1}
                      onChange={data => this.props.updateItemSettings({
                        dns1: data.value,
                      })}
                      {...firstDNS}
                    />
                    <FormGroup
                      type="text"
                      label={__('Secondary DNS')}
                      value={dns2}
                      onChange={data => this.props.updateItemSettings({
                        dns2: data.value,
                      })}
                      {...secondDNS}
                    />
                  </div>
                )
              }
              {
                this.props.route.funConfig.hasVlan ? (
                  <div>
                    <h3>{__('VLAN Settings')}</h3>
                    <div className="clearfix">
                      <FormGroup
                        label={__('VLAN Enable')}
                        type="checkbox"
                        className="fl"
                        disabled={this.apMode === '1'}
                        checked={vlanEnable === '1'}
                        onClick={() => {
                          this.props.updateItemSettings({
                            vlanEnable: vlanEnable === '1' ? '0' : '1',
                          });
                        }}
                      />
                      {
                        this.apMode === '1' ? (
                          <span
                            className="fl"
                            style={{
                              marginLeft: '10px',
                              marginTop: '7px',
                            }}
                          >
                            {__('Notice: The device is in thin AP mode now, VLAN is enabled by force.')}
                          </span>
                        ) : null
                      }
                    </div>
                    <FormGroup
                      type="number"
                      min="1"
                      max="4094"
                      defaultValue="1"
                      label={__('Management VLAN ID')}
                      disabled={vlanEnable === '0'}
                      help={`${__('Range: ')}1 - 4094, ${__('Default: ')}1`}
                      value={mngVlanId}
                      onChange={data => this.props.updateItemSettings({
                        mngVlanId: data.value,
                      })}
                      required
                      {...validVlanId1}
                    />
                    <FormGroup
                      type="number"
                      min="1"
                      max="4094"
                      defaultValue="1"
                      label={__('Untagged VLAN ID')}
                      help={`${__('Range: ')}1 - 4094, ${__('Default: ')}1`}
                      value={utgVlanId}
                      disabled={vlanEnable === '0'}
                      onChange={data => this.props.updateItemSettings({
                        utgVlanId: data.value,
                      })}
                      required
                      {...validVlanId2}
                    />
                  </div>
                ) : null
              }
            </div>
          ) : null
        }

        {
          networkMode === 'router' ? (
            <div>
              <FormGroup
                type="select"
                label={__('WAN IP Mode')}
                options={[
                  { value: 'static', label: __('Static IP') },
                  { value: 'dhcp', label: __('DHCP') },
                  { value: 'pppoe', label: __('PPPOE') },
                ]}
                minWidth="66px"
                value={this.props.store.getIn(['curData', 'routerInfo', 'proto'])}
                onChange={(data) => {
                  this.updateItemInRouterInfo('proto', data.value);
                }}
              />
              {
                // DHCP
                store.getIn(['curData', 'routerInfo', 'proto']) === 'dhcp' ? (
                  <div>
                    <FormGroup
                      label={__('LAN IP')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'lanIp'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('lanIp', data.value);
                      }}
                    />
                    <FormGroup
                      label={__('Subnet Mask')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'lanMask'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('lanMask', data.value);
                      }}
                    />
                  </div>
                ) : null
              }
              {
                // static
                store.getIn(['curData', 'routerInfo', 'proto']) === 'static' ? (
                  <div>
                    <FormGroup
                      label={__('WAN IP')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'wanIp'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('ip', data.value);
                      }}
                    />
                    <FormGroup
                      label={__('Subnet Mask')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'wanMask'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('wanMask', data.value);
                      }}
                    />
                    <FormGroup
                      type="text"
                      label={__('Gateway')}
                      value={this.props.store.getIn(['curData', 'routerInfo', 'gateway'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('gateway', data.value);
                      }}
                    />
                    <FormGroup
                      type="text"
                      label={__('Primary DNS')}
                      value={this.props.store.getIn(['curData', 'routerInfo', 'dns1'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('dns1', data.value);
                      }}
                    />
                    <FormGroup
                      type="text"
                      label={__('Secondary DNS')}
                      value={this.props.store.getIn(['curData', 'routerInfo', 'dns2'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('dns2', data.value);
                      }}
                    />
                    <FormGroup
                      label={__('LAN IP')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'lanIp'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('lanIp', data.value);
                      }}
                    />
                    <FormGroup
                      label={__('Subnet Mask')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'lanMask'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('lanMask', data.value);
                      }}
                    />
                  </div>
                ) : null
              }
              {
                // PPPOE
                store.getIn(['curData', 'routerInfo', 'proto']) === 'pppoe' ? (
                  <div>
                    <FormGroup
                      type="text"
                      label={__('Account')}
                      value={store.getIn(['curData', 'routerInfo', 'user'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('user', data.value);
                      }}
                    />
                    <FormGroup
                      type="text"
                      label={__('Password')}
                      value={store.getIn(['curData', 'routerInfo', 'password'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('password', data.value);
                      }}
                    />
                    <FormGroup
                      label={__('LAN IP')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'lanIp'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('lanIp', data.value);
                      }}
                    />
                    <FormGroup
                      label={__('Subnet Mask')}
                      type="text"
                      value={this.props.store.getIn(['curData', 'routerInfo', 'lanMask'])}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('lanMask', data.value);
                      }}
                    />
                  </div>
                ) : null
              }
              <FormGroup
                type="checkbox"
                checked={store.getIn(['curData', 'routerInfo', 'nat']) === '1'}
                label={__('NAT')}
                onChange={() => {
                  const val = store.getIn(['curData', 'routerInfo', 'nat']) === '1' ? '0' : '1';
                  this.updateItemInRouterInfo('nat', val);
                }}
              />
              <h3>{__('DHCP Pool')}</h3>
              <FormGroup
                type="checkbox"
                checked={store.getIn(['curData', 'routerInfo', 'dhcpEnable']) === '1'}
                label={__('DHCP Sever')}
                onChange={() => {
                  const val = store.getIn(['curData', 'routerInfo', 'dhcpEnable']) === '1' ? '0' : '1';
                  this.updateItemInRouterInfo('dhcpEnable', val);
                }}
              />
              {
                store.getIn(['curData', 'routerInfo', 'dhcpEnable']) === '1' ? (
                  <div>
                    <FormGroup
                      type="text"
                      value={store.getIn(['curData', 'routerInfo', 'startIp'])}
                      label={__('Start IP Adress')}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('startIp', data.value);
                      }}
                    />
                    <FormGroup
                      type="text"
                      value={store.getIn(['curData', 'routerInfo', 'endIp'])}
                      label={__('End IP Adress')}
                      onChange={(data) => {
                        this.updateItemInRouterInfo('endIp', data.value);
                      }}
                    />
                  </div>
                ) : null
              }
            </div>
          ) : null
        }

        <div className="form-group form-group--save">
          <div className="form-control">
            <SaveButton
              type="button"
              loading={this.props.app.get('saving')}
              onClick={this.onSave}
            />
          </div>
        </div>
      </div>
    );
  }
}

NetworkSettings.propTypes = propTypes;
NetworkSettings.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.settings,
    selfState: state.networksettings,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    utils.extend({}, appActions, sharedActions, selfActions),
    dispatch,
  );
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions),
)(NetworkSettings);

export const networksettings = reducer;
