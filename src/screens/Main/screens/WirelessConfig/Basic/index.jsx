import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import validator from 'shared/validator';
import { bindActionCreators } from 'redux';
import { FormGroup, FormInput, Modal, Table, SaveButton, icon } from 'shared/components';
import { Button } from 'shared/components/Button';
import { actions as appActions } from 'shared/containers/app';
import { actions } from 'shared/containers/settings';
import * as selfActions from './actions';
import reducer from './reducer.js';
import countryMap from './country.js';

const propTypes = {
  app: PropTypes.instanceOf(Map),
  save: PropTypes.func,
  store: PropTypes.instanceOf(Map),
  selfState: PropTypes.instanceOf(Map),
  validateAll: PropTypes.func,

  route: PropTypes.object,
  initSettings: PropTypes.func,
  fetchSettings: PropTypes.func,
  fetch: PropTypes.func,
  saveSettings: PropTypes.func,
  updateItemSettings: PropTypes.func,
  leaveSettingsScreen: PropTypes.func,
  validateOption: PropTypes.object,

  changeScanStatus: PropTypes.func,
  changeShowScanResultStatus: PropTypes.func,
  changeSelectedResult: PropTypes.func,
  leaveScreen: PropTypes.func,

  changeCtyModal: PropTypes.func,
  changeAgreeProtocol: PropTypes.func,
  changeCountryCode: PropTypes.func,
  closeCountrySelectModal: PropTypes.func,
  saveCountrySelectModal: PropTypes.func,
  receiveCountryInfo: PropTypes.func,
  resetVaildateMsg: PropTypes.func,

  changeTitleShowIcon: PropTypes.func,
  changeTableItemForSsid: PropTypes.func,
  createModal: PropTypes.func,
  updateSelfItemSettings: PropTypes.func,
  updateBasicSettings: PropTypes.func,
  updateMultiSsidItem: PropTypes.func,
  updateRadioSettingsItem: PropTypes.func,
  changeWhichButton: PropTypes.func,
  restoreSelfState: PropTypes.func,
};

const defaultProps = {};
let vlanEnable = '0';

const devicemodeOptions = [
  { value: 'ap', label: __('AP') },
  { value: 'sta', label: __('Station') },
  { value: 'repeater', label: __('Repeater') },
];

const staAndApSecurityOptions = [
  { value: 'none', label: 'None' },
  { value: 'wpa', label: 'WPA-PSK' },
  { value: 'wpa2', label: 'WPA2-PSK' },
  { value: 'wpa-mixed', label: 'WPA-PSK/WPA2-PSK' },
  { value: 'wep', label: 'WEP' },
];

const repeaterSecurityOptions = [
  { value: 'none', label: 'None' },
  { value: 'wep', label: 'WEP' },
];

const wepAuthenOptions = [
  { value: 'open', label: 'Open' },
  { value: 'shared', label: 'Shared' },
];

/*
const wepKeyLengthOptions = [
  { value: '64', label: '64bit' },
  { value: '128', label: '128bit' },
];
*/

const keyIndexOptions = [
  { value: '1', label: 'key 1' },
  { value: '2', label: 'key 2' },
  { value: '3', label: 'key 3' },
  { value: '4', label: 'key 4' },
];

const keyTypeOptions = [
  { value: 'Hex', label: 'Hex' },
  { value: 'ASCII', label: 'ASCII' },
];

const radioModeOptions = [
  { value: 'auto', label: 'auto' },
  { value: '11ac', label: '802.11ac' },
  { value: '11na', label: '802.11a+n' },
  { value: '11a', label: '802.11a' },
];

const channelWidthOptions = [
  { value: 'HT20', label: '20MHz' },
  { value: 'HT40', label: '40MHz' },
  { value: 'HT80', label: '80MHz' },
];

const validOptions = Map({
  validSsid: validator({
    rules: 'remarkTxt:["\'\\\\"]|len:[1, 31]',
  }),
  staApmac: validator({
    rules: 'mac',
  }),
  apmac1: validator({
    rules: 'mac',
  }),
  apmac2: validator({
    rules: 'mac',
  }),
  apmac3: validator({
    rules: 'mac',
  }),
  validPwd: validator({
    rules: 'pwd|len:[8, 32]',
  }),
  Hex: validator({
    rules: 'hex|len:[10, 10]',
  }),
  ASCII: validator({
    rules: 'ascii|len:[5, 5]',
  }),
  validVlanId: validator({
    rules: 'num:[1, 4094]',
  }),
});

export default class Basic extends React.Component {

  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.onHideSsidboxClick = this.onHideSsidboxClick.bind(this);
    // this.onAutoRepeatBoxClick = this.onAutoRepeatBoxClick.bind(this);
    this.onStopScanClick = this.onStopScanClick.bind(this);
    this.onScanBtnClick = this.onScanBtnClick.bind(this);
    this.onModalOkBtnClick = this.onModalOkBtnClick.bind(this);
    this.onModalCloseBtnClick = this.onModalCloseBtnClick.bind(this);
    this.onSelectScanResultItem = this.onSelectScanResultItem.bind(this);
    this.onChengeWirelessMode = this.onChengeWirelessMode.bind(this);
    this.noErrorThisPage = this.noErrorThisPage.bind(this);
    this.makeCountryOptions = this.makeCountryOptions.bind(this);
    this.getCountryNameFromCode = this.getCountryNameFromCode.bind(this);
    this.onCloseCountrySelectModal = this.onCloseCountrySelectModal.bind(this);
    this.makeChannelOptions = this.makeChannelOptions.bind(this);

    // this.onShowIconClick = this.onShowIconClick.bind(this);
    this.onSecurityModeChange = this.onSecurityModeChange.bind(this);
    this.onAddNewSsidItem = this.onAddNewSsidItem.bind(this);
    this.onDeleteBtnClick = this.onDeleteBtnClick.bind(this);
    this.onSsidItemChange = this.onSsidItemChange.bind(this);
    this.fetchFullPageData = this.fetchFullPageData.bind(this);
    this.firstInAndRefresh = this.firstInAndRefresh.bind(this);
  }

  componentWillMount() {
    this.firstInAndRefresh();
  }

  componentDidUpdate(prevProps) {
    if (this.props.app.get('refreshAt') !== prevProps.app.get('refreshAt')) {
      const asyncStep = Promise.resolve(this.props.restoreSelfState());
      asyncStep.then(() => {
        this.firstInAndRefresh();
      });
    }
  }

  componentWillUnmount() {
    this.props.leaveSettingsScreen();
    this.props.leaveScreen();
    this.props.resetVaildateMsg();
  }

  onSave(url, module, validID) {
    // module指selfState中的radioSettings,multiSsid,basicSettings
    this.props.validateAll(validID).then((msg) => {
      if (msg.isEmpty()) {
        const dataToSave = this.props.selfState.get(module).toJS();
        this.props.save(url, dataToSave).then((json) => {
          if (json.state && json.state.code === 2000) {
            this.fetchFullPageData();
          }
        });
      }
    });
  }

  onHideSsidboxClick() {
    const basicSettings = this.props.selfState.get('basicSettings');
    const hideSsid = basicSettings.getIn(['vapList', '0', 'hideSsid']) === '1' ? '0' : '1';
    const vapList = basicSettings.get('vapList').setIn(['0', 'hideSsid'], hideSsid);
    this.props.updateBasicSettings({ vapList });
  }
  /*
  onAutoRepeatBoxClick() {
    const val = (this.props.store.getIn(['curData', 'autoRepeat']) === '1') ? '0' : '1';
    this.props.updateItemSettings({
      autoRepeat: val,
    });
  }
  */

  onStopScanClick() {
    this.props.changeScanStatus(false);
    this.props.changeShowScanResultStatus(false);
  }
  onScanBtnClick() {
    this.props.changeScanStatus(true);
    this.props.fetch('goform/get_site_survey').then((json) => {
      if (json.state && json.state.code === 2000) {
        this.props.updateItemSettings({
          scanResult: fromJS(json.data),
        });
        if (this.props.selfState.get('scaning') === true)
          this.props.changeShowScanResultStatus(true);
        this.props.changeScanStatus(false);
      }
    });
  }
  onModalOkBtnClick() {
    const {
      mac, ssid, security, frequency, channelWidth,
    } = this.props.selfState.get('selectedResult').toJS();
    const basicSettings = this.props.selfState.get('basicSettings');
    if (!this.props.selfState.get('selectedResult').isEmpty()) {
      let peers = basicSettings.getIn(['vapList', '0', 'peers']);
      if (peers !== undefined) { peers = peers.set('0', mac); }
      const firstSsid = basicSettings.getIn(['vapList', '0'])
                        .set('peers', peers).set('ssid', ssid).set('apMac', mac)
                        .set('security', fromJS(security).set('key', ''))
                        .set('frequency', frequency)
                        .set('channelWidth', channelWidth);
      const vapList = basicSettings.get('vapList').set('0', firstSsid);
      this.props.updateBasicSettings({ vapList });
      this.props.updateItemSettings({ scanResult: fromJS({}) });
      this.props.changeShowScanResultStatus(false);
      this.props.changeSelectedResult(fromJS({}));
    }
  }
  onModalCloseBtnClick() {
    this.props.changeShowScanResultStatus(false);
    this.props.changeSelectedResult(fromJS({}));
  }
  onSelectScanResultItem(item) {
    const { ssid, mac, security, frequency, channelWidth } = item.toJS();
    const result = fromJS({}).set('ssid', ssid).set('mac', mac)
                  .set('frequency', frequency)
                  .set('channelWidth', channelWidth)
                  .set('security', security);
    this.props.changeSelectedResult(result);
  }
  onChengeWirelessMode(data) {
    this.props.fetch('goform/get_wl_info').then((json) => {
      // 首先更新curData中的数据，防止之前修改模式但未保存时加密方式发生变化，目的是切换回去后显示原来的数据
      this.props.updateBasicSettings(fromJS(json.data));
      if (json.state && json.state.code === 2000) {
        this.props.updateBasicSettings({
          wirelessMode: data.value,
        });
        // 处理切换成repeater后，加密方式为空的问题
        if (data.value === 'repeater' && json.data.vapList[0].security.mode !== 'wep') {
          const vapList = this.props.selfState.getIn(['basicSettings', 'vapList'])
                              .setIn([0, 'security', 'mode'], 'none');
          this.props.updateBasicSettings({ vapList });
        }
      }
    });
  }
  onCloseCountrySelectModal() {
    this.props.fetch('goform/get_base_wl_info').then((json) => {
      if (json.state && json.state.code === 2000) {
        this.props.closeCountrySelectModal(json.data.countryCode);
      }
    });
  }

  onSecurityModeChange(data) {
    const basicSettings = this.props.selfState.get('basicSettings');
    const preSecurity = basicSettings.getIn(['vapList', '0', 'security']);
    const mode = data.value;
    const auth = preSecurity.get('auth') || 'shared';
    const keyLength = preSecurity.get('keyLength') || '64';
    const keyType = preSecurity.get('keyType') || 'Hex';
    const key = preSecurity.get('key') || '';
    const keyIndex = preSecurity.get('keyIndex') || '1';
    const cipher = preSecurity.get('cipher') || 'aes';
    const afterSecurity = preSecurity.set('mode', mode).set('auth', auth)
                          .set('keyType', keyType).set('keyLength', keyLength)
                          .set('keyIndex', keyIndex)
                          .set('cipher', cipher)
                          .set('key', key);
    const vapList = basicSettings.getIn(['vapList'])
                    .setIn(['0', 'security'], afterSecurity);
    this.props.updateBasicSettings({ vapList });
  }

  onAddNewSsidItem() {
    const newSsid = fromJS({
      flag: Math.random(),
      ssid: '',
      vlanId: '1',
      hideSsid: '0',
      enable: '1',
      security: {
        mode: 'none',
        cipher: 'aes',
        auth: 'open',
        keyLength: '64',
        keyType: 'Hex',
        keyIndex: '1',
        key: '',
      },
    });
    const vapList = this.props.selfState.getIn(['multiSsid', 'vapList']).push(newSsid);
    if (vapList.size <= 16) { // 最大支持16个SSID
      this.props.updateMultiSsidItem({ vapList });
    }
  }

  onDeleteBtnClick(item) {
    const multiSsid = this.props.selfState.get('multiSsid');
    const num = multiSsid.getIn(['vapList']).keyOf(item);
    const vapList = multiSsid.getIn(['vapList']).delete(num);
    this.props.updateMultiSsidItem({ vapList });
  }

  onSsidItemChange(val, item, valId, newVal) {
    const multiSsid = this.props.selfState.get('multiSsid');
    const itemNum = multiSsid.getIn(['vapList']).keyOf(item);
    const newItem = item.set(valId, newVal);
    const vapList = multiSsid.getIn(['vapList']).set(itemNum, newItem);
    this.props.updateMultiSsidItem({ vapList });
  }

  getCountryNameFromCode(code, map) {
    for (const name of Object.keys(map)) {
      if (map[name] === code) {
        return __(name);
      }
    }
    return '';
  }

  fetchFullPageData() {
    this.props.fetch('goform/get_base_wl_info').then((json) => {
      if (json.state && json.state.code === 2000) {
        const radioInfo = {
          curModule: 'radioSettings',
          data: fromJS(json.data),
        };
        const country = json.data.countryCode;
        this.props.changeCountryCode(country);
        const channelWidth = json.data.channelWidth;
        const saveInfo = {
          radio: '5G',
          country,
          channelWidth,
        };
        this.props.updateSelfItemSettings(radioInfo);
        this.props.fetch('goform/get_country_info', saveInfo).then((json2) => {
          if (json2.state && json2.state.code === 2000) {
            this.props.receiveCountryInfo(json2.data);
          }
        });
      } }).then(() => {
        this.props.fetch('goform/get_wl_info').then((json) => {
          if (json.state && json.state.code === 2000) {
            const basicInfo = {
              curModule: 'basicSettings',
              data: fromJS(json.data),
            };
            const multiSsidInfo = {
              curModule: 'multiSsid',
              data: fromJS(json.data),
            };
            this.props.updateSelfItemSettings(basicInfo);
            this.props.updateSelfItemSettings(multiSsidInfo);
          }
        });
      });
  }

  // countryMap为Object
  makeCountryOptions(map) {
    const countryList = [];
    for (const key of Object.keys(map)) {
      const entry = {
        label: __(key),
        value: map[key],
      };
      countryList.push(entry);
    }
    return countryList;
  }

  noErrorThisPage() {
    const errorMsg = this.props.app.get('invalid');
    if (errorMsg.isEmpty()) {
      return true;
    }
    return false;
  }

  makeChannelOptions() {
    const channelList = this.props.selfState.get('channels');
    // const channelOptions = [{ value: 'auto', label: 'auto' }];
    const channelOptions = channelList.map((val) => {
      return {
        value: parseInt(val, 10).toString(),
        label: val,
      };
    })
    .unshift({ value: 'auto', label: 'auto' })
    .toJS();
    return channelOptions;
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
      saveQuery: {},
      defaultData: {
      },
    });
    this.fetchFullPageData();
    props.changeTitleShowIcon({ name: 'showRadioSetting', value: true });
    props.changeTitleShowIcon({ name: 'showSsidSetting', value: true });
    props.changeShowScanResultStatus(false);
    props.changeScanStatus(false);
    props.changeTableItemForSsid(fromJS({
      isShow: '0',
      val: '',
      item: fromJS({}),
    }));
    props.fetch('goform/get_network_info').then((json) => {
      if (json.state && json.state.code === 2000) {
        vlanEnable = json.data.vlanEnable;
      }
    });
  }

  render() {
    const modalOptions = fromJS([
      {
        id: 'operate',
        text: __('Select'),
        transform: function (val, item) {
          return (
            <FormInput
              type="radio"
              name="selectScanItem"
              onChange={() => this.onSelectScanResultItem(item)}
            />
          );
        }.bind(this),
      },
      {
        id: 'mac',
        text: __('MAC'),
      },
      {
        id: 'ssid',
        text: __('SSID'),
      },
      {
        id: 'security',
        text: __('Security Mode'),
        transform: function (val) {
          const mode = val.get('mode');
          if (mode === 'wpa') return 'WPA-PSK';
          else if (mode === 'wpa2') return 'WPA2-PSK';
          else if (mode === 'wpa-mixed') return 'WPA/WPA2-PSK';
          else if (mode === 'wep') return 'WEP';
          return mode;
        }.bind(this),
      },
      {
        id: 'signal',
        text: __('Signal'),
      },
      {
        id: 'noise',
        text: __('Noise'),
      },
      {
        id: 'protocol',
        text: __('Protocol'),
      },
      {
        id: 'frequency',
        text: __('Channel'),
      },
      {
        id: 'channelWidth',
        text: __('Channel Width'),
      },
    ]);
    const ssidTableOptions = fromJS([
      {
        id: 'enable',
        label: __('Enable'),
        width: '200px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <input
              type="checkbox"
              checked={val === '1'}
              disabled={pos === 0}
              onClick={() => this.onSsidItemChange(val, item, 'enable', (val === '1' ? '0' : '1'))}
              style={{ marginLeft: '3px' }}
            />
          );
        }.bind(this),
      },
      {
        id: 'ssid',
        label: __('SSID'),
        width: '250px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <FormInput
              type="text"
              value={val}
              disabled={pos === 0}
              onChange={data => this.onSsidItemChange(val, item, 'ssid', data.value)}
              style={{
                marginLeft: '-60px',
                height: '29px',
              }}
            />
          );
        }.bind(this),
      },
      {
        id: 'vlanId',
        label: __('Vlan ID'),
        width: '250px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <FormInput
              type="number"
              value={val}
              disabled={pos === 0 || vlanEnable === '0'}
              onChange={data => this.onSsidItemChange(val, item, 'vlanId', data.value)}
              style={{
                marginLeft: '-60px',
                height: '29px',
              }}
            />
          );
        }.bind(this),
      },
      {
        id: 'hideSsid',
        label: __('Hide'),
        width: '200px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <input
              type="checkbox"
              checked={val === '1'}
              disabled={pos === 0}
              onChange={
                () => this.onSsidItemChange(val, item, 'hideSsid', (val === '1' ? '0' : '1'))
              }
              style={{ marginLeft: '3px' }}
            />
          );
        }.bind(this),
      },
      {
        id: 'isolation',
        label: __('Client Isolation'),
        width: '200px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <input
              type="checkbox"
              checked={val === '1'}
              disabled={pos === 0}
              onChange={
                () => this.onSsidItemChange(val, item, 'isolation', (val === '1' ? '0' : '1'))
              }
              style={{ marginLeft: '20px' }}
            />
          );
        }.bind(this),
      },
      {
        id: 'security',
        label: __('Security Edit'),
        width: '200px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <div style={{ marginLeft: '-3px' }}>
              <Button
                text={__('Edit')}
                icon="pencil-square"
                size="sm"
                disabled={pos === 0}
                onClick={() => {
                  const tableItemForSsid = fromJS({}).set('val', val)
                        .set('item', item).set('isShow', '1')
                        .set('pos', pos);
                  this.props.changeTableItemForSsid(tableItemForSsid);
                }}
              />
            </div>
          );
        }.bind(this),
      },
      {
        id: 'delete',
        label: __('Delete'),
        width: '200px',
        transform: function (val, item) {
          const pos = this.props.selfState.getIn(['multiSsid', 'vapList']).keyOf(item);
          return (
            <div style={{ marginLeft: '-12px' }}>
              <Button
                text={__('Delete')}
                icon="times"
                size="sm"
                disabled={pos === 0}
                onClick={() => this.onDeleteBtnClick(item)}
              />
            </div>
          );
        }.bind(this),
      },
    ]);

    // const curData = this.props.store.get('curData');
    const radioSettings = this.props.selfState.get('radioSettings');
    const multiSsid = this.props.selfState.get('multiSsid');
    const basicSettings = this.props.selfState.get('basicSettings');
    const { staApmac, apmac1, apmac2, apmac3, validSsid, validPwd } = this.props.validateOption;
    const tableItemForSsid = this.props.selfState.get('tableItemForSsid');
    if (this.props.store.get('curSettingId') === 'base') {
      return null;
    }

    return (
      <div className="stats-group">
        <Modal
          isShow={this.props.selfState.get('showScanResult')}
          onOk={this.onModalOkBtnClick}
          onClose={this.onModalCloseBtnClick}
          okText={__('Select')}
          cancelText={__('Cancel')}
          size="lg"
          okButton
          cancelButton
          draggable
        >
          <Table
            className="table"
            options={modalOptions}
            list={this.props.store.getIn(['curData', 'scanResult', 'siteList'])}
          />
        </Modal>{ /* SSID 扫描弹出框 */ }

        <div className="stats-group-cell">
          {
            this.props.selfState.get('showSsidSetting') ? (
              <icon
                className="fa fa-minus-square-o"
                size="lg"
                style={{
                  marginRight: '4px',
                }}
                onClick={() => this.props.changeTitleShowIcon({
                  name: 'showSsidSetting',
                  value: false,
                })}
              >
                <span
                  style={{
                    fontSize: '1.17em',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    paddingLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {__('Basic Settings')}
                </span>
              </icon>
            ) : (
              <icon
                className="fa fa-plus-square"
                size="lg"
                style={{
                  marginRight: '4px',
                }}
                onClick={() => this.props.changeTitleShowIcon({
                  name: 'showSsidSetting',
                  value: true,
                })}
              >
                <span
                  style={{
                    fontSize: '1.17em',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    paddingLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {__('Basic Settings')}
                </span>
              </icon>
            )
          }
        </div>
        {
          this.props.selfState.get('showSsidSetting') ? (
            <div
              className="stats-group-cell"
              style={{
                overflow: 'visible',
              }}
            >
              <div>
                <FormGroup
                  type="select"
                  options={devicemodeOptions}
                  value={basicSettings.get('wirelessMode')}
                  onChange={data => this.onChengeWirelessMode(data)}
                  label={__('Device Mode')}
                /> { /* 模式选择下拉框 */}
                {/*
                <div className="fl">
                  { // repeater独有的自动选框
                    (basicSettings.get('wirelessMode') === 'repeater') ? (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '11px',
                        }}
                      >&nbsp;&nbsp;
                        <input
                          style={{
                            paddingBottom: '-2px',
                          }}
                          type="checkbox"
                          checked={basicSettings.get('autoRepeat') === '1'}
                          onClick={this.onAutoRepeatBoxClick}
                        />&nbsp;
                        {__('Auto')}
                      </span>
                    ) : null
                  }
                </div>
                */}
              </div>
              { // SSID输入框**ap模式**
                basicSettings.get('wirelessMode') === 'ap' ? (
                  <div
                    className="clearfix"
                  >
                    <div
                      style={{
                        width: '370px',
                      }}
                      className="fl"
                    >
                      <FormGroup
                        label={__('SSID')}
                        form="basicSettings"
                        type="text"
                        value={basicSettings.getIn(['vapList', '0', 'ssid'])}
                        onChange={(data) => {
                          const vapList = basicSettings.get('vapList')
                                          .setIn(['0', 'ssid'], data.value);
                          this.props.updateBasicSettings({ vapList });
                        }}
                        required
                        {...validSsid}
                      />
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: '11px',
                      }}
                      className="fl"
                    >
                      <input
                        style={{
                          marginBottom: '-2px',
                          marginRight: '4px',
                        }}
                        type="checkbox"
                        checked={basicSettings.getIn(['vapList', '0', 'hideSsid']) === '1'}
                        onClick={data => this.onHideSsidboxClick(data)}
                      />
                      {__('Hide')}
                    </div>
                  </div>
                ) : null
              }
              { // SSID输入框**station模式**
                basicSettings.get('wirelessMode') === 'sta' ? (
                  <div className="clearfix">
                    <div
                      style={{
                        width: '500px',
                      }}
                    >
                      <div
                        className="fl"
                        style={{
                          width: '370px',
                        }}
                      >
                        <FormGroup
                          label={__('Remote SSID')}
                          type="text"
                          value={basicSettings.getIn(['vapList', '0', 'ssid'])}
                          onChange={(data) => {
                            const vapList = basicSettings.get('vapList')
                                            .setIn(['0', 'ssid'], data.value);
                            this.props.updateBasicSettings({ vapList });
                          }}
                          required
                          {...validSsid}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        paddingTop: '2px',
                      }}
                      className="fl"
                    >
                      {
                        this.props.selfState.get('scaning') ? (
                          <Button
                            text={__('Stop')}
                            onClick={this.onStopScanClick}
                            loading
                          />
                        ) : (
                          <Button
                            text={__('Scan')}
                            onClick={this.onScanBtnClick}
                          />
                        )
                      }
                    </div>
                  </div>
                ) : null
              }
              { // SSID输入框**repeater模式**
                basicSettings.get('wirelessMode') === 'repeater' ? (
                  <div className="clearfix">
                    <div
                      style={{
                        width: '500px',
                      }}
                    >
                      <div
                        className="fl"
                        style={{
                          width: '370px',
                        }}
                      >
                        <FormGroup
                          label={__('Remote SSID')}
                          className="fl"
                          type="text"
                          value={basicSettings.getIn(['vapList', '0', 'ssid'])}
                          onChange={(data) => {
                            const vapList = basicSettings.get('vapList')
                                            .setIn(['0', 'ssid'], data.value);
                            this.props.updateBasicSettings({ vapList });
                          }}
                          required
                          {...validSsid}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        paddingTop: '2px',
                      }}
                      className="fl"
                    >
                      {
                        this.props.selfState.get('scaning') ? (
                          <Button
                            text={__('Stop')}
                            onClick={this.onStopScanClick}
                            loading
                          />
                        ) : (
                          <Button
                            text={__('Scan')}
                            onClick={this.onScanBtnClick}
                          />
                        )
                      }
                    </div>
                    <div
                      style={{
                        marginTop: '11px',
                        marginLeft: '4px',
                      }}
                      className="fl"
                    >
                      <input
                        type="checkbox"
                        checked={basicSettings.getIn(['vapList', '0', 'hideSsid']) === '1'}
                        onClick={data => this.onHideSsidboxClick(data)}
                      />
                      {__('Hide')}
                    </div>
                  </div>
                ) : null
              }
              <FormGroup
                type="number"
                label={__('Vlan ID')}
                value={basicSettings.getIn(['vapList', '0', 'vlanId'])}
                help={__('Range: 1~4094')}
                form="basicSettings"
                disabled={vlanEnable === '0'}
                onChange={(data) => {
                  const vapList = basicSettings.get('vapList').setIn([0, 'vlanId'], data.value);
                  this.props.updateBasicSettings({ vapList });
                }}
                required
                {...this.props.validateOption.validVlanId}
              />
              {
                basicSettings.get('wirelessMode') === 'repeater' ||
                basicSettings.get('wirelessMode') === 'ap' ? (
                  <FormGroup
                    label={__('Client Isolation')}
                    type="checkbox"
                    checked={basicSettings.getIn(['vapList', '0', 'isolation']) === '1'}
                    onChange={(data) => {
                      const vapList = basicSettings.getIn(['vapList'])
                                      .setIn(['0', 'isolation'], data.value);
                      this.props.updateBasicSettings({ vapList });
                    }}
                  />
                ) : null
              }

              { // repeater模式下，对端AP的mac地址输入框
                (basicSettings.get('wirelessMode') === 'repeater') ? (
                  <div>
                    <FormGroup
                      label="WDS Peers"
                      type="text"
                      value={basicSettings.getIn(['vapList', '0', 'peers', '0']) || ''}
                      onChange={(data) => {
                        const peer1 = basicSettings.getIn(['vapList', '0', 'peers', '1']) || '';
                        const peer2 = basicSettings.getIn(['vapList', '0', 'peers', '2']) || '';
                        const vapList = basicSettings.get('vapList')
                                        .setIn(['0', 'peers', '0'], data.value)
                                        .setIn(['0', 'peers', '1'], peer1)
                                        .setIn(['0', 'peers', '2'], peer2);
                        this.props.updateBasicSettings({ vapList });
                      }}
                      {...apmac1}
                    />
                    <FormGroup
                      type="text"
                      value={basicSettings.getIn(['vapList', '0', 'peers', '1']) || ''}
                      onChange={(data) => {
                        const peer0 = basicSettings.getIn(['vapList', '0', 'peers', '0']) || '';
                        const peer2 = basicSettings.getIn(['vapList', '0', 'peers', '2']) || '';
                        const vapList = basicSettings.get('vapList')
                                        .setIn(['0', 'peers', '0'], peer0)
                                        .setIn(['0', 'peers', '1'], data.value)
                                        .setIn(['0', 'peers', '2'], peer2);
                        this.props.updateBasicSettings({ vapList });
                      }}
                      {... apmac2}
                    />
                    <FormGroup
                      type="text"
                      value={basicSettings.getIn(['vapList', '0', 'peers', '2']) || ''}
                      onChange={(data) => {
                        const peer0 = basicSettings.getIn(['vapList', '0', 'peers', '0']) || '';
                        const peer1 = basicSettings.getIn(['vapList', '0', 'peers', '1']) || '';
                        const vapList = basicSettings.get('vapList')
                                        .setIn(['0', 'peers', '0'], peer0)
                                        .setIn(['0', 'peers', '1'], peer1)
                                        .setIn(['0', 'peers', '2'], data.value);
                        this.props.updateBasicSettings({ vapList });
                      }}
                      {... apmac3}
                    />
                  </div>
                ) : null
              }
              { // station模式下，对端AP的mac地址输入框
                (basicSettings.get('wirelessMode') === 'sta') ? (
                  <div>
                    <FormGroup
                      label={__('Lock To AP')}
                      type="checkbox"
                      checked={basicSettings.getIn(['vapList', '0', 'apMacEnable']) === '1'}
                      onChange={(data) => {
                        const vapList = basicSettings.get('vapList')
                                        .setIn(['0', 'apMacEnable'], data.value);
                        this.props.updateBasicSettings({ vapList });
                      }}
                    />
                    {
                      basicSettings.getIn(['vapList', '0', 'apMacEnable']) === '1' ? (
                        <FormGroup
                          label={__('Peer Mac')}
                          form="basicSettings"
                          value={basicSettings.getIn(['vapList', '0', 'apMac'])}
                          onChange={(data) => {
                            const vapList = basicSettings.get('vapList')
                                                        .setIn(['0', 'apMac'], data.value);
                            this.props.updateBasicSettings({ vapList });
                          }}
                          placeholder={__('not necessary')}
                          {...staApmac}
                        />
                      ) : null
                    }
                  </div>
                ) : null
              }

              <div>
                { // 加密方式选择框
                  (basicSettings.get('wirelessMode') === 'sta' ||
                    basicSettings.get('wirelessMode') === 'ap') ? (
                      <div>
                        <FormGroup
                          label={__('Security')}
                          type="select"
                          options={staAndApSecurityOptions}
                          value={basicSettings.getIn(['vapList', '0', 'security', 'mode']) || 'none'}
                          onChange={data => this.onSecurityModeChange(data)}
                        />
                      </div>
                  ) : null
                }
                {
                  (basicSettings.get('wirelessMode') === 'repeater') ? (
                    <div>
                      <FormGroup
                        label={__('Security')}
                        type="select"
                        options={repeaterSecurityOptions}
                        value={basicSettings.getIn(['vapList', '0', 'security', 'mode'])}
                        onChange={data => this.onSecurityModeChange(data)}
                      />
                    </div>
                  ) : null
                }
                {
                  (basicSettings.getIn(['vapList', '0', 'security', 'mode']) === 'none' ||
                  basicSettings.getIn(['vapList', '0', 'security', 'mode']) === 'wep') ? null : (
                    <div>
                      <FormGroup
                        label={__('Encryption')}
                        minWidth="66px"
                        type="switch"
                        value={basicSettings.getIn(['vapList', '0', 'security', 'cipher'])}
                        onChange={(data) => {
                          const security = basicSettings.getIn(['vapList', '0', 'security'])
                                                  .set('cipher', data.value);
                          const vapList = basicSettings.get('vapList')
                                                  .setIn(['0', 'security'], security);
                          this.props.updateBasicSettings({ vapList });
                        }}
                        options={[
                          { label: 'AES', value: 'aes' },
                          { label: 'TKIP', value: 'tkip' },
                          { label: 'MIXED', value: 'aes&tkip' },
                        ]}
                      />
                      <FormGroup
                        label={__('Password')}
                        type="password"
                        form="basicSettings"
                        required
                        value={basicSettings.getIn(['vapList', '0', 'security', 'key'])}
                        onChange={(data) => {
                          const security = basicSettings.getIn(['vapList', '0', 'security'])
                                                        .set('key', data.value);
                          const vapList = basicSettings.get('vapList')
                                                      .setIn(['0', 'security'], security);
                          this.props.updateBasicSettings({ vapList });
                        }}
                        {...validPwd}
                      />
                    </div>
                  )
                }
                {
                  (basicSettings.getIn(['vapList', '0', 'security', 'mode']) === 'wep') ? (
                    <div>
                      <FormGroup
                        label={__('Auth Type')}
                        type="select"
                        options={wepAuthenOptions}
                        value={basicSettings.getIn(['vapList', '0', 'security', 'auth'])}
                        onChange={(data) => {
                          const security = basicSettings.getIn(['vapList', '0', 'security'])
                                          .set('auth', data.value);
                          const vapList = basicSettings.get('vapList')
                                          .setIn(['0', 'security'], security);
                          this.props.updateBasicSettings({ vapList });
                        }}
                      />
                      {/*
                        <FormGroup
                          label={__('Key Length')}
                          type="select"
                          options={wepKeyLengthOptions}
                          value={curData.getIn(['vapList', '0', 'security', 'keyLength'])}
                          onChange={(data) => {
                            const security = curData.getIn(['vapList', '0', 'security'])
                                            .set('keyLength', data.value);
                            const vapList = curData.get('vapList')
                                            .setIn(['0', 'security'], security);
                            this.props.updateItemSettings({ vapList });
                          }}
                        />
                      */}
                      <FormGroup
                        label={__('Key Index')}
                        type="select"
                        options={keyIndexOptions}
                        value={basicSettings.getIn(['vapList', '0', 'security', 'keyIndex'])}
                        onChange={(data) => {
                          const security = basicSettings.getIn(['vapList', '0', 'security'])
                                          .set('keyIndex', data.value);
                          const vapList = basicSettings.get('vapList')
                                          .setIn(['0', 'security'], security);
                          this.props.updateBasicSettings({ vapList });
                        }}
                      />
                      <FormGroup
                        label={__('Key Format')}
                        type="select"
                        options={keyTypeOptions}
                        value={basicSettings.getIn(['vapList', '0', 'security', 'keyType'])}
                        onChange={(data) => {
                          const security = basicSettings.getIn(['vapList', '0', 'security'])
                                                  .set('keyType', data.value);
                          const vapList = basicSettings.get('vapList')
                                .setIn(['0', 'security'], security);
                          this.props.updateBasicSettings({ vapList });
                        }}
                      />
                      <FormGroup
                        type="password"
                        required
                        label={__('Password')}
                        form="basicSettings"
                        value={basicSettings.getIn(['vapList', '0', 'security', 'key'])}
                        onChange={(data) => {
                          const security = basicSettings.getIn(['vapList', '0', 'security'])
                                                  .set('key', data.value);
                          const vapList = basicSettings.get('vapList')
                                          .setIn(['0', 'security'], security);
                          this.props.updateBasicSettings({ vapList });
                        }}
                        {...this.props.validateOption[basicSettings.getIn(['vapList', '0', 'security', 'keyType'])]}
                      />
                    </div>
                  ) : null
                }
              </div>
              <FormGroup>
                <SaveButton
                  type="button"
                  loading={this.props.app.get('saving') &&
                          this.props.selfState.get('whichButton') === 'basicSettings'}
                  onClick={() => {
                    this.props.changeWhichButton('basicSettings');
                    this.onSave('goform/set_wireless', 'basicSettings', 'basicSettings');
                  }}
                />
              </FormGroup>
            </div>
          ) : null
        }

        <div className="stats-group-cell">
          {
            this.props.selfState.get('showRadioSetting') ? (
              <icon
                className="fa fa-minus-square-o"
                size="lg"
                onClick={() => this.props.changeTitleShowIcon({
                  name: 'showRadioSetting',
                  value: false,
                })}
              >
                <span
                  style={{
                    fontSize: '1.17em',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    paddingLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {__('Radio Settings')}
                </span>
              </icon>
            ) : (
              <icon
                className="fa fa-plus-square"
                size="lg"
                style={{
                  marginRight: '4px',
                }}
                onClick={() => this.props.changeTitleShowIcon({
                  name: 'showRadioSetting',
                  value: true,
                })}
              >
                <span
                  style={{
                    fontSize: '1.17em',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    paddingLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {__('Radio Settings')}
                </span>
              </icon>
            )
          }
        </div>
        {
          this.props.selfState.get('showRadioSetting') ? (
            <div
              className="stats-group-cell"
              style={{
                overflow: 'visible',
              }}
            >
              <FormGroup
                type="checkbox"
                label={__('Radio')}
                checked={radioSettings.get('enable') === '1'}
                onChange={data => this.props.updateRadioSettingsItem({
                  enable: data.value,
                })}
              />
              <FormGroup
                label={__('Country')}
              >
                <FormInput
                  type="text"
                  value={this.getCountryNameFromCode(
                      this.props.selfState.get('selectedCountry'),
                      countryMap
                    )}
                  disabled
                  style={{
                    width: '127px',
                    marginTop: '-3px',
                  }}
                />
                <Button
                  text={__('Change')}
                  style={{
                    marginLeft: '-1px',
                    width: '70px',
                  }}
                  onClick={() => { this.props.changeCtyModal(true); }}
                />
              </FormGroup>
              <Modal
                title={__('Country Code')}
                onClose={this.onCloseCountrySelectModal}
                onOk={this.props.saveCountrySelectModal}
                isShow={this.props.selfState.get('showCtyModal')}
                draggable
              >
                <h3>{__('User Protocol')}</h3>
                <span>
                  {__('The initial Wi-Fi setup requires you to specify the country code for the country in which the AP operates. Configuring a country code ensures the radio’s frequency bands, channels, and transmit power levels are compliant with country-specific regulations.')}
                </span>
                <FormGroup
                  type="radio"
                  text={__('I have read and agree')}
                  checked={this.props.selfState.get('agreeProtocol')}
                  onChange={() => { this.props.changeAgreeProtocol(true); }}
                />
                <FormGroup
                  label={__('Country')}
                  type="select"
                  options={this.makeCountryOptions(countryMap)}
                  value={this.props.selfState.get('selectedCountry')}
                  onChange={data => this.props.changeCountryCode(data.value)}
                  disabled={!this.props.selfState.get('agreeProtocol')}
                />
              </Modal>
              <FormGroup
                label={__('Radio Mode')}
                type="select"
                options={radioModeOptions}
                value={radioSettings.get('radioMode')}
                onChange={(data) => {
                  this.props.updateRadioSettingsItem({
                    radioMode: data.value,
                  });
                }}
              />
              <FormGroup
                label={__('Channel')}
                type="select"
                options={this.makeChannelOptions()}
                value={radioSettings.get('frequency') || 'auto'}
                onChange={data => this.props.updateRadioSettingsItem({
                  frequency: data.value || 'auto',
                })}
              />
              <FormGroup
                label={__('Channel Bandwidth')}
                type="switch"
                minWidth="66px"
                options={channelWidthOptions}
                value={radioSettings.get('channelWidth')}
                onChange={data => this.props.updateRadioSettingsItem({
                  channelWidth: data.value,
                })}
              />
              <FormGroup
                label={__('Output Power')}
                type="range"
                min="1"
                max={this.props.selfState.get('maxTxpower')}
                // help={radioSettings.get('txPower')}
                value={radioSettings.get('txPower')}
                onChange={data => this.props.updateRadioSettingsItem({
                  txPower: data.value,
                })}
              />
              <FormGroup>
                <SaveButton
                  type="button"
                  loading={this.props.app.get('saving') &&
                          this.props.selfState.get('whichButton') === 'radioSettings'}
                  onClick={() => {
                    this.props.changeWhichButton('radioSettings');
                    this.onSave('goform/set_base_wl', 'radioSettings', 'radioSettings');
                  }}
                />
              </FormGroup>
              {
                /*
                <FormGroup
                  label={__('Max TX Rate')}
                  type="select"
                  value={maxTxRate}
                  options={rateOptions}
                  onChange={(data) => this.props.updateItemSettings({
                    maxTxRate: data.value,
                  })}
                />
                */
              }
            </div>
          ) : null
        }

        <div className="stats-group-cell">
          {
            this.props.selfState.get('showMultiSsid') ? (
              <icon
                className="fa fa-minus-square-o"
                size="lg"
                style={{ marginRight: '4px' }}
                onClick={() => this.props.changeTitleShowIcon({
                  name: 'showMultiSsid',
                  value: false,
                })}
              >
                <span
                  style={{
                    fontSize: '1.17em',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    paddingLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {__('Multiple SSID')}
                </span>
              </icon>
            ) : (
              <icon
                className="fa fa-plus-square"
                size="lg"
                style={{ marginRight: '4px' }}
                onClick={() => this.props.changeTitleShowIcon({
                  name: 'showMultiSsid',
                  value: true,
                })}
              >
                <span
                  style={{
                    fontSize: '1.17em',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    paddingLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {__('Multiple SSID')}
                </span>
              </icon>
            )
          }
        </div>
        {
          this.props.selfState.get('showMultiSsid') ? (
            <div className="stats-group-cell">
              <span>{__('Notice: The first SSID can\'t be modefied here !')}</span>
              <Table
                className="table"
                options={ssidTableOptions}
                list={(() => {
                  const list = fromJS([]);
                  if (multiSsid.has('vapList')) {
                    if (multiSsid.get('wirelessMode') !== 'sta') {
                      return multiSsid.get('vapList');
                    }
                    return multiSsid.get('vapList').setSize(1);
                  }
                  return list;
                })()
                }
              />
              <div
                className="stats-group-cell"
                style={{ marginTop: '10px' }}
              >
                <Button
                  text={__('Add')}
                  icon="plus"
                  onClick={() => this.onAddNewSsidItem()}
                  style={{ marginRight: '10px' }}
                  disabled={multiSsid.get('wirelessMode') === 'sta'}
                />
                <SaveButton
                  type="button"
                  loading={this.props.app.get('saving') &&
                          this.props.selfState.get('whichButton') === 'multiSsid'}
                  disabled={multiSsid.get('wirelessMode') === 'sta'}
                  onClick={() => {
                    let error = '';
                    const vapList = multiSsid.get('vapList').toJS();
                    const len = vapList.length;
                    const re = /^[0-9]*[1-9][0-9]*$/;
                    for (let i = 0; i < len; i++) {
                      if (!re.test(vapList[i].vlanId)) {
                        error = 'Id number must be positive interger !';
                        break;
                      }
                      if (vapList[i].vlanId < 1 || vapList[i].vlanId > 4094) {
                        error = 'Id number out of range ! (1 ~ 4094)';
                        break;
                      }
                      if (vapList[i].ssid === '') {
                        error = 'SSID can not be empty string !';
                        break;
                      }
                      // for (let j = i + 1; j < len; j++) {
                      //   if (vapList[i].ssid === vapList[j].ssid) {
                      //     error = 'The same ssid are not allowed!';
                      //     break;
                      //   }
                      // }
                    }
                    if (error === '') {
                      this.props.changeWhichButton('multiSsid');
                      this.onSave('goform/set_wireless', 'multiSsid', 'multiSsid');
                    } else {
                      this.props.createModal({
                        id: 'settings',
                        role: 'alert',
                        text: error,
                      });
                    }
                  }}
                />
              </div>
            </div>
          ) : null
        }

        {
          /*
          <div className="form-group form-group--save">
            <div className="form-control">
              <SaveButton
                type="button"
                loading={this.props.app.get('saving')}
                onClick={this.onSave}
              />
            </div>
          </div>
        */
        }
        <Modal
          title={__('Security Settings For SSID')}
          isShow={tableItemForSsid.get('isShow') === '1'}
          draggable
          onOk={() => {
            this.props.validateAll('ssidSecurityModal').then((msg) => {
              if (msg.isEmpty()) {
                const pos = tableItemForSsid.get('pos');
                const vapList = multiSsid.getIn(['vapList'])
                                .set(pos, tableItemForSsid.get('item'));
                this.props.updateMultiSsidItem({ vapList });
                this.props.changeTableItemForSsid(fromJS({
                  isShow: '0',
                  val: '',
                  item: {},
                  pos: '',
                }));
              }
            });
          }}
          onClose={() => {
            this.props.changeTableItemForSsid(fromJS({
              isShow: '0',
              val: '',
              item: {},
              pos: '',
            }));
          }}
          okButton
          cancelButton
        >
          <FormGroup
            label={__('Security')}
            type="select"
            options={staAndApSecurityOptions}
            value={tableItemForSsid.getIn(['item', 'security', 'mode'])}
            onChange={(data) => {
              const newItem = tableItemForSsid.get('item')
                              .setIn(['security', 'mode'], data.value);
              const newItemForSsid = tableItemForSsid.set('item', newItem);
              this.props.changeTableItemForSsid(newItemForSsid);
            }}
          />
          {
            (tableItemForSsid.getIn(['item', 'security', 'mode']) === 'none' ||
              tableItemForSsid.getIn(['item', 'security', 'mode']) === 'wep') ? null : (
                <div>
                  <FormGroup
                    label={__('Encryption')}
                    minWidth="66px"
                    type="switch"
                    value={tableItemForSsid.getIn(['item', 'security', 'cipher'])}
                    options={[
                      { label: 'AES', value: 'aes' },
                      { label: 'TKIP', value: 'tkip' },
                      { label: 'MIXED', value: 'aes&tkip' },
                    ]}
                    onChange={(data) => {
                      const newItem = tableItemForSsid.get('item')
                                      .setIn(['security', 'cipher'], data.value);
                      const newItemForSsid = tableItemForSsid.set('item', newItem);
                      this.props.changeTableItemForSsid(newItemForSsid);
                    }}
                  />
                  <FormGroup
                    label={__('Password')}
                    type="password"
                    required
                    form="ssidSecurityModal"
                    value={tableItemForSsid.getIn(['item', 'security', 'key'])}
                    onChange={(data) => {
                      const newItem = tableItemForSsid.get('item')
                                      .setIn(['security', 'key'], data.value);
                      const newItemForSsid = tableItemForSsid.set('item', newItem);
                      this.props.changeTableItemForSsid(newItemForSsid);
                    }}
                    {...validPwd}
                  />
                </div>
            )
          }
          {
            (tableItemForSsid.getIn(['item', 'security', 'mode']) === 'wep') ? (
              <div>
                <FormGroup
                  label={__('Auth Type')}
                  type="select"
                  options={wepAuthenOptions}
                  value={tableItemForSsid.getIn(['item', 'security', 'auth'])}
                  onChange={(data) => {
                    const newItem = tableItemForSsid.get('item')
                                    .setIn(['security', 'auth'], data.value);
                    const newItemForSsid = tableItemForSsid.set('item', newItem);
                    this.props.changeTableItemForSsid(newItemForSsid);
                  }}
                />
                {
                  /**
                  <FormGroup
                    label={__('Key Length')}
                    type="select"
                    options={wepKeyLengthOptions}
                    value={tableItemForSsid.getIn(['item', 'security', 'keyLength'])}
                    onChange={(data) => {
                      const newItem = tableItemForSsid.get('item')
                                      .setIn(['security', 'keyLength'], data.value);
                      const newItemForSsid = tableItemForSsid.set('item', newItem);
                      this.props.changeTableItemForSsid(newItemForSsid);
                    }}
                  />
                   */
                }
                <FormGroup
                  label={__('Key Index')}
                  type="select"
                  options={keyIndexOptions}
                  value={tableItemForSsid.getIn(['item', 'security', 'keyIndex'])}
                  onChange={(data) => {
                    const newItem = tableItemForSsid.get('item')
                                    .setIn(['security', 'keyIndex'], data.value);
                    const newItemForSsid = tableItemForSsid.set('item', newItem);
                    this.props.changeTableItemForSsid(newItemForSsid);
                  }}
                />
                <FormGroup
                  label={__('Key Format')}
                  type="select"
                  options={keyTypeOptions}
                  value={tableItemForSsid.getIn(['item', 'security', 'keyType'])}
                  onChange={(data) => {
                    const newItem = tableItemForSsid.get('item')
                                    .setIn(['security', 'keyType'], data.value);
                    const newItemForSsid = tableItemForSsid.set('item', newItem);
                    this.props.changeTableItemForSsid(newItemForSsid);
                  }}
                />
                <FormGroup
                  type="password"
                  required
                  label={__('Password')}
                  form="ssidSecurityModal"
                  value={tableItemForSsid.getIn(['item', 'security', 'key'])}
                  onChange={(data) => {
                    const newItem = tableItemForSsid.get('item')
                                    .setIn(['security', 'key'], data.value);
                    const newItemForSsid = tableItemForSsid.set('item', newItem);
                    this.props.changeTableItemForSsid(newItemForSsid);
                  }}
                  {...this.props.validateOption[tableItemForSsid.getIn(['item', 'security', 'keyType'])]}
                />
              </div>
            ) : null
          }
        </Modal>

      </div>
    );
  }
}

Basic.propTypes = propTypes;
Basic.defaultProps = defaultProps;

function mapStateToProps(state) {
  // console.log('state.basic', state.basic);
  return {
    app: state.app,
    store: state.settings,
    selfState: state.basic,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    actions,
    selfActions,
  ), dispatch);
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions)
)(Basic);

export const basic = reducer;