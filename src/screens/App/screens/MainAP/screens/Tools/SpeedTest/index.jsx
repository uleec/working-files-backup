import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import {
  Button, FormGroup, FormInput, Modal, Table, Icon,
} from 'shared/components';
import validator from 'shared/utils/lib/validator';
import { bindActionCreators } from 'redux';
import * as appActions from 'shared/actions/app';
import * as sharedActions from 'shared/actions/settings';
import * as selfActions from './actions';
import selfReducer from './reducer';


let a; let b;
const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  validateAll: PropTypes.func,
  validateOption: PropTypes.object,

  route: PropTypes.object,
  initSettings: PropTypes.func,
  fetch: PropTypes.func,
  fetchSettings: PropTypes.func,
  saveSettings: PropTypes.func,
  updateItemSettings: PropTypes.func,
  leaveSettingsScreen: PropTypes.func,

  selfState: PropTypes.object,
  initSelfState: PropTypes.func,
  toggleShowAdvanceBtn: PropTypes.func,
  changeShowScanResults: PropTypes.func,
  changeSelectedIp: PropTypes.func,
  changeTimeClock: PropTypes.func,
  changeQueryData: PropTypes.func,
  resetVaildateMsg: PropTypes.func,
  changeStopWait: PropTypes.func,
  save: PropTypes.func,
  receiveTestResult: PropTypes.func,
  restoreSelfState: PropTypes.func,
  createModal: PropTypes.func,
};

const defaultProps = {};

const validOptions = Map({
  validIp: validator({
    rules: 'ip',
  }),
  validTime: validator({
    rules: 'num:[10, 300]',
  }),
  validPkgLen: validator({
    rules: 'num:[128, 1448]',
  }),
});
export default class SpeedTest extends React.Component {

  constructor(props) {
    super(props);
    this.onSelectBtnClick = this.onSelectBtnClick.bind(this);
    this.onModalOkClick = this.onModalOkClick.bind(this);
    this.onModalCancelClick = this.onModalCancelClick.bind(this);
    this.onSelectScanResultItem = this.onSelectScanResultItem.bind(this);
    this.createIpTableList = this.createIpTableList.bind(this);
    this.onRunTest = this.onRunTest.bind(this);
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
    this.props.resetVaildateMsg();
    this.props.changeTimeClock('');
    clearInterval(a);
    clearTimeout(b);
  }
  onSelectBtnClick() {
    this.props.fetch('goform/get_ip_list').then((json) => {
      if (json.state && json.state.code === 2000) {
        this.props.updateItemSettings({
          ipList: fromJS(json.data.ipList),
        });
      }
    });
    this.props.changeShowScanResults(true);
  }
  onModalOkClick() {
    const selectedIp = this.props.selfState.get('selectedIp');
    if (selectedIp !== '') {
      this.props.updateItemSettings({
        ip: this.props.selfState.get('selectedIp'),
        ipList: fromJS([]),
      });
      this.props.changeShowScanResults(false);
    }
    this.props.changeSelectedIp('');
  }

  onModalCancelClick() {
    this.props.changeShowScanResults(false);
    this.props.updateItemSettings({
      ipList: fromJS([]),
    });
    this.props.changeSelectedIp('');
  }

  onSelectScanResultItem(val, item) {
    const ip = item.get('ip');
    this.props.changeSelectedIp(ip);
  }

  onRunTest() {
    // this.props.toggleShowResultBtn('0');
    clearInterval(a);
    this.props.validateAll().then((msg) => {
      if (msg.isEmpty()) {
        // this.props.clickSpeedTestRunBtn();
        this.props.receiveTestResult({ tx: 0, rx: 0 });
        this.props.changeStopWait(false);
        const query = this.props.store.get('curData').toJS();
        this.props.save('goform/bandwidth_test', query).then((json) => {
          if (json.state && json.state.code === 2000) {
            b = setInterval(() => {
              this.props.fetch('goform/get_bandwidth').then((json2) => {
                if (json2.state && json2.state.code === 2000) {
                  this.props.receiveTestResult(json2.data);
                  this.props.changeStopWait(true);
                  clearInterval(a);
                  clearInterval(b);
                } else if (json2.state && json2.state.code === 4000) {
                  clearInterval(a);
                  clearInterval(b);
                  this.props.changeTimeClock(_('Test failed! Something wrong happened with the network!'));
                }
              });
            }, 2000);
          } else if (json.state && json.state.code === 4000) {
            this.props.changeStopWait(true);
            this.props.createModal({
              id: 'settings',
              role: 'alert',
              text: _('Error: The destination can not be reached!'),
            });
          }
        });
        // let clock = parseInt(this.props.store.getIn(['curData', 'time']), 10);
        // this.props.changeTimeClock(clock);
        // a = setInterval(() => {
        //   const timeStr = (clock--).toString();
        //   this.props.changeTimeClock(timeStr);
        //   if (clock === 0) {
        // const txt = _('The test is not complete, please keep waiting...');
        const txt = _('Running test, please wait ...');
        this.props.changeTimeClock(txt);
        //     clearInterval(a);
        //   }
        // }, 1000);
      }
    });
  }

  createIpTableList() {
    const immutList = this.props.store.getIn(['curData', 'ipList']);
    const list = [];
    if (immutList !== undefined) {
      const ipList = immutList.toJS();
      for (const val of ipList) {
        list.push({ ip: val });
      }
    }
    return list;
  }

  firstInAndRefresh() {
    const defaultData = {
      ip: '',
      time: '30',
      direction: '0',
      packagelen: '128',
    };
    const props = this.props;
    clearInterval(a);
    clearTimeout(b);
    props.initSettings({
      settingId: props.route.id,
      fetchUrl: props.route.formUrl,
      saveUrl: props.route.saveUrl,
      defaultData,
    });
    props.initSelfState(defaultData);
    props.changeShowScanResults(false);
  }

  render() {
    const {
      ip, time, direction, packagelen,
    } = this.props.store.get('curData').toJS();
    const {
      showAdvance, stopWait, rx, tx, query,
    } = this.props.selfState.toJS();
    const { validIp, validTime, validPkgLen } = this.props.validateOption;
    const scanIpOptions = fromJS([
      {
        id: 'action',
        text: _('Select'),
        width: '50',
        transform: function (val, item) {
          return (
            <FormInput
              type="radio"
              name="ipselection"
              onChange={() => this.onSelectScanResultItem(val, item)}
            />
          );
        }.bind(this),
      },
      {
        id: 'ip',
        text: _('IP'),
      },
    ]);
    return (
      <div className="o-form">
        <div className="o-form__legend">{_('Speed Test')}</div>
        <div className="clearfix">
          <div
            className="fl"
            style={{ width: '370px' }}
          >
            <FormGroup
              type="text"
              label={_('Destination IP')}
              value={ip}
              onChange={(data) => this.props.updateItemSettings({
                ip: data.value,
              })}
              required
              {...validIp}
            />
          </div>
          <Button
            className="fl"
            theme="default"
            text={_('Select')}
            onClick={this.onSelectBtnClick}
          />
        </div>
        <Modal
          cancelText={_('Cancel')}
          okText={_('OK')}
          onOk={this.onModalOkClick}
          onClose={this.onModalCancelClick}
          cancelButton
          okButton
          isShow={this.props.selfState.get('showScanResults')}
        >
          <Table
            className="table"
            options={scanIpOptions}
            list={this.createIpTableList()}
          />
        </Modal>
        <FormGroup
          type="radio"
          label={_('Flow Direction')}
        >
          <div
            style={{
              marginTop: '8px',
            }}
          >
            <FormInput
              type="radio"
              name="directionSelect"
              text={_('Duplex')}
              checked={direction === '0'}
              onChange={() => this.props.updateItemSettings({
                direction: '0',
              })}
            />
            <FormInput
              type="radio"
              name="directionSelect"
              text={_('Receive')}
              checked={direction === '1'}
              onChange={() => this.props.updateItemSettings({
                direction: '1',
              })}
            />
            <FormInput
              type="radio"
              name="directionSelect"
              text={_('Transmit')}
              checked={direction === '2'}
              onChange={() => this.props.updateItemSettings({
                direction: '2',
              })}
            />
          </div>
        </FormGroup>
        <div className="o-form__legend">{_('Bandwidth Status')}</div>
        <div
          style={{
            width: '400px',
            marginLeft: '100px',
            padding: '5px',
          }}
        >
          <div
            className="clearfix"
            style={{
              width: '100%',
              padding: '10px 10px',
              border: '1px solid #aaa',
              boxShadow: '0px 1px 3px rgba(34, 25, 25, 0.2)',
            }}
          >
            <div
              className="fl"
              style={{
                border: '1px solid #CCC',
                padding: '10px',
                margin: '5px 10px',
                width: '160px',
                boxShadow: '0px 1px 5px rgba(34, 25, 25, 0.5)',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  textAlign: 'center',
                }}
              >
                {rx + ' Mbps'}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#CCC',
                }}
              >
                {_('Download')}
              </div>
            </div>
            <div
              className="fr"
              style={{
                border: '1px solid #CCC',
                padding: '10px',
                margin: '5px 10px',
                width: '160px',
                boxShadow: '0px 1px 3px rgba(34, 25, 25, 0.5)',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  textAlign: 'center',
                }}
              >
                {tx + ' Mbps'}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#CCC',
                }}
              >
                {_('Upload')}
              </div>
            </div>
          </div>
          <div
            style={{
              width: '100%',
              marginTop: '15px',
              textAlign: 'center',
            }}
          >
            <Button
              theme="primary"
              text={_('Run Test')}
              onClick={this.onRunTest}
            />
            <span
              style={{
                display: 'inline-block',
                width: '20px',
              }}
            />
            <Button
              theme="primary"
              text={_('Advanced')}
              onClick={() => {
                const pQuery = {
                  time,
                  packagelen,
                };
                this.props.changeQueryData(pQuery);
                this.props.toggleShowAdvanceBtn();
              }}
            />
          </div>
        </div>
        {// 测速高级配置弹出页面
        }
        <Modal
          isShow={showAdvance === '1'}
          title={_('Advanced Settings')}
          onClose={() => {
            const pQuery = {
              time,
              packagelen,
            };
            this.props.changeQueryData(pQuery);
            this.props.toggleShowAdvanceBtn();
          }}
          onOk={() => {
            this.props.validateAll('advancedOptions').then((msg) => {
              if (msg.isEmpty()) {
                this.props.updateItemSettings(query);
                this.props.toggleShowAdvanceBtn();
              }
            });
          }}
        >
          <FormGroup
            type="number"
            label={_('Package Length')}
            form="advancedOptions"
            value={this.props.selfState.getIn(['query', 'packagelen'])}
            help={_('range:128B ~ 1448B')}
            onChange={(data) => {
              const pQuery = this.props.selfState.get('query').set('packagelen', data.value);
              this.props.changeQueryData(pQuery);
            }}
            required
            {...validPkgLen}
          />
          <FormGroup
            type="number"
            label={_('Test Duration')}
            form="advancedOptions"
            value={this.props.selfState.getIn(['query', 'time'])}
            help={_('range:10s ~ 300s')}
            onChange={(data) => {
              const pQuery = this.props.selfState.get('query').set('time', data.value);
              this.props.changeQueryData(pQuery);
            }}
            required
            {...validTime}
          />
        </Modal>
        {// 测试过程中提示用户等待的弹出页面
        }
        <Modal
          size="min"
          title={_('Notice')}
          noFooter
          isShow={!stopWait}
          onClose={() => {
            this.props.fetch('goform/stop_bandwidth_test').then((json) => {
              if (json.state && json.state.code === 2000) {
                this.props.changeStopWait(true);
                clearInterval(a);
                clearTimeout(b);
              }
            });
          }}
        >
          <div
            style={{
              textAlign: 'center',
              margin: '10px 0',
            }}
          >
            <Icon name="spinner" className="spinner" spin size="lg" />
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: '15px',
            }}
          >
            {
              /[0-9]+/.test(this.props.selfState.get('time')) ? (
                _('Time Remaining: ') + this.props.selfState.get('time') + 's'
              ) : (
                this.props.selfState.get('time')
              )
            }
          </div>
        </Modal>
      </div>
    );
  }
}

SpeedTest.propTypes = propTypes;
SpeedTest.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.settings,
    selfState: state.speedtest,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    utils.extend({}, appActions, sharedActions, selfActions),
    dispatch
  );
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions)
)(SpeedTest);


export const speedtest = selfReducer;