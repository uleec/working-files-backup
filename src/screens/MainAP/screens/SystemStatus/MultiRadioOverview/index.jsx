import React from 'react'; import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';
import { EchartReact, FormInput } from 'shared/components';
import Table from 'shared/components/Table';
import utils from 'shared/utils';
import { actions as sharedActions } from 'shared/containers/settings';
import { actions as appActions } from 'shared/containers/app';
import { colors } from 'shared/config/axc';
import * as selfActions from './actions';
import reducer from './reducer';

import './index.scss';

const flowRateFilter = utils.filter('flowRate');
const propTypes = {
  store: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  product: PropTypes.instanceOf(Map),
  selfState: PropTypes.instanceOf(Map),
  initSettings: PropTypes.func,
  fetchSettings: PropTypes.func,
  fetch: PropTypes.func,
  changeCurrRadioConfig: PropTypes.func,
  changeCustomSettingsForChart: PropTypes.func,

  // updateItemSettings: PropTypes.func,
  leaveSettingsScreen: PropTypes.func,
  app: PropTypes.instanceOf(Map),
  changeFirstRefresh: PropTypes.func,
  changeServerData: PropTypes.func,
};
const defaultProps = {};
const interfaceOptions = fromJS([
  {
    id: 'name',
    text: __('Name'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '152px',
  }, {
    id: 'mac',
    text: __('MAC'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '152px',
  }, {
    id: 'txBytes',
    text: __('Tx Data'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return flowRateFilter.transform(val);
    },
    width: '144px',
  }, {
    id: 'rxBytes',
    text: __('Rx Data'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return flowRateFilter.transform(val);
    },
    width: '144px',
  }, {
    id: 'txPackets',
    text: __('Tx Packets'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'rxPackets',
    text: __('Rx Packets'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'txErrorPackets',
    text: __('Tx Errors'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'rxErrorPackets',
    text: __('Rx Errors'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'status',
    text: __('Status'),
    render(val) {
      if (val === '') {
        return '--';
      }
      return __(val);
    },
  },
]);

function changeUptimeToReadable(time) {
  let timeStr = '';
  const t = parseInt(time, 10);
  const days = Math.floor(t / (24 * 3600));
  const hours = Math.floor((t - (days * 24 * 3600)) / 3600);
  const minutes = Math.floor((t - (days * 24 * 3600) - (hours * 3600)) / 60);
  const seconds = Math.floor((t - (days * 24 * 3600) - (hours * 3600) - (minutes * 60)) % 60);
  if (days > 0) {
    timeStr = `${days}d ${hours}h ${minutes}m ${seconds}s `;
  } else if (hours > 0) {
    timeStr = `${hours}h ${minutes}m ${seconds}s `;
  } else if (minutes > 0) {
    timeStr = `${minutes}m ${seconds}s `;
  } else {
    timeStr = `${seconds}s`;
  }
  return timeStr;
}

function wirelessModeShowStyle(wirelessMode) {
  let ret = '';
  switch (wirelessMode) {
    case 'sta':
      ret = 'Station'; break;
    case 'repeater':
      ret = 'Repeater'; break;
    case 'ap':
      ret = 'AP'; break;
    default:
  }
  return ret;
}

function getTopTenFlowClientsOption(serverData) {
  let dataList = serverData.get('top10FlowClients');
  const ret = {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} ({d}%)',
    },
    title: {
      text: __('Top10 Flow Clients'),
      // left: '48%',
      x: 'center',
      textStyle: {
        fontWeight: 'normal',
        fontSize: '18',
      },
    },
    legend: {
      show: true,
      orient: 'vertical',
      x: 'left',
      y: 'bottom',
      itemGap: 7,
      tooltip: {
        show: true,
      },
      formatter: (name) => {
        const num = dataList.find($$item => $$item.get('name') === name).get('value');
        const numStr = flowRateFilter.transform(num);
        return name.length > 11 ? `${name.substring(0, 11)}... : ${numStr}` : `${name} : ${numStr}`;
      },
    },
    series: [
      {
        name: `${__('Name')}/MAC`,
        type: 'pie',
        radius: '50%',
        avoidLabelOverlap: false,
        label: {
          // formatter: '{b}: {c}',
          normal: {
            show: false,
            //position: 'center',
          },
          emphasis: {
            show: false,
            textStyle: {
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
        },
        center: ['65%', '55%'],
        labelLine: {
          normal: {
            show: false,
          },
        },
      },
    ],
  };

  if (List.isList(dataList)) {
    dataList = dataList.map((item) => {
      let name;
      const userName = item.get('name');
      if (!userName || userName === '') {
        name = item.get('mac');  // 如果没有name，则使用mac代替
      } else {
        name = userName;
      }
      return item.set('name', name)
                .set('value', `${parseInt(item.get('value'), 10)}`)
                .delete('mac'); // 删除数据中的mac变量
    });
    ret.legend.data = dataList.map(item => `${item.get('name')}`).toJS();
    ret.series[0].data = dataList.toJS();
  }
  return ret;
}

function getFlowPerSsidOption(serverData) {
  let dataList = serverData.get('flowPerSsid');
  const ret = {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} ({d}%)',
    },
    title: {
      text: __('SSID Flow'),
      x: 'center',
      // left: '53%',
      textStyle: {
        fontWeight: 'normal',
        fontSize: '18',
      },
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      y: 'bottom',
      itemGap: 7,
    },
    series: [
      {
        name: 'SSID',
        type: 'pie',
        radius: '50%',
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            //position: 'center',
          },
          emphasis: {
            show: false,
            textStyle: {
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
        },
        center: ['65%', '55%'],
        labelLine: {
          normal: {
            show: false,
          },
        },
      },
    ],
  };

  if (List.isList(dataList)) {
    dataList = dataList.map(item => item.set('name', `${item.get('name')}: ${flowRateFilter.transform(item.get('value'))}`)
                                        .set('value', `${Number(item.get('value'))}`));
    ret.legend.data = dataList.map(item => `${item.get('name')}`).toJS();
    ret.series[0].data = dataList.toJS();
  }

  return ret;
}

function modifySignalShowStyle(valueStr) {
  const len = valueStr.length;
  let val = '';
  switch (len) {
    case 1 :
      val = `${valueStr}      dBm`;
      break;
    case 2:
      val = `${valueStr}     dBm`;
      break;
    case 3:
      val = `${valueStr}   dBm`;
      break;
    case 4:
      val = `${valueStr} dBm`;
      break;
    default: val = `${valueStr} dBm`;
  }
  return val;
}

export default class SystemStatus extends React.Component {
  constructor(props) {
    super(props);
    // this.changeUptimeToReadable = this.changeUptimeToReadable.bind(this);
    utils.binds(this, [
      'onChangeRadio', 'prepareChartData', 'getCpuAndMemPercentOption', 'getStaPeerFlowOption',
    ]);
  }

  componentWillMount() {
    clearInterval(this.timeInterval);
    // 必须要有初始化，因为要在settings中插入一个由该页面id命名的对象
    this.props.initSettings({
      settingId: this.props.route.id,
      fetchUrl: this.props.route.fetchUrl,
      defaultData: {},
    });
    // this.props.changeCurrRadioConfig(this.props.product.getIn(['deviceRadioList', 0]));
    this.props.fetch('goform/get_firstLogin_info').then((json) => {
      if (json.state && json.state.code === 2000 && json.data.ifFirstLogin === '0') {
        this.props.fetchSettings().then(() => {
          this.props.changeFirstRefresh(false);
          // const customSetings = this.props.selfState.get('customSettingsForChart').toJS();
          this.prepareChartData();
        });
      }
    });
    this.onChangeRadio({ value: '0' });
    this.timeInterval = setInterval(() => {
      this.props.fetchSettings().then(() => {
        this.prepareChartData();
      });
    }, 10000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.app.get('refreshAt') !== prevProps.app.get('refreshAt')) {
      clearInterval(this.timeInterval);
      this.props.fetchSettings();
      this.onChangeRadio({ value: '0' });
      this.timeInterval = setInterval(this.props.fetchSettings, 10000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);
    this.props.leaveSettingsScreen();
    this.props.changeFirstRefresh(true);
  }
  onChangeRadio(data) { // 注意参数实际是data的value属性，这里表示radio序号
    const radioType = this.props.product.getIn(['deviceRadioList', data.value, 'radioType']);
    const config = fromJS({
      radioId: data.value,
      radioType,
    });
    this.props.changeCurrRadioConfig(config);
  }

  getCpuAndMemPercentOption() {
    const cpuUsed = parseInt(this.props.store.getIn(['curData', 'sysStatus', 'cpuInfo']), 10);
    const memUsed = parseInt(this.props.store.getIn(['curData', 'sysStatus', 'memInfo']), 10);
    const xAxisData = ['CPU', __('Memory')];
    const data1 = [cpuUsed, memUsed];
    const data2 = [100 - cpuUsed, 100 - memUsed];

    const itemStyle = {
      normal: {
      },
      emphasis: {
        barBorderWidth: 1,
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        // shadowColor: 'rgba(0,0,0,0.5)',
      },
    };

    const option = {
      color: ['#f6402b', '#00a7f6'],
      backgroundColor: '#edf4fd',
      legend: {
        data: [__('Used'), __('Free')],
        orient: 'vertical',
        align: 'left',
        y: 'bottom',
        left: 10,
      },
      title: {
        text: __('CPU/MEM Usage'),
        x: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: '18',
        },
      },
      brush: {
        toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
        xAxisIndex: 0,
      },
      toolbox: {
        feature: {
          magicType: {
            type: ['stack', 'tiled'],
          },
          dataView: {},
        },
      },
      tooltip: {
        show: true,
        formatter: '{a} <br/> {b} : {c}%',
      },
      yAxis: {
        data: xAxisData,
        silent: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitArea: { show: false },
      },
      xAxis: {
        inverse: false,
        splitArea: { show: false },
      },
      grid: {
        left: 100,
      },
      series: [
        {
          name: __('Used'),
          type: 'bar',
          stack: 'one',
          barWidth: 25,
          itemStyle,
          data: data1,
        },
        {
          name: __('Free'),
          type: 'bar',
          stack: 'one',
          barWidth: 25,
          itemStyle,
          data: data2,
        },
      ],
    };

    return option;
  }

  getStaPeerFlowOption() {
    const radioId = this.props.selfState.getIn(['currRadioConfig', 'radioId']);
    const download = this.props.store.getIn(['curData', 'radioList', radioId, 'vapList', '0', 'txBytes']);
    const upload = this.props.store.getIn(['curData', 'radioList', radioId, 'vapList', '0', 'rxBytes']);
    const downloadFlow = flowRateFilter.transform(download);
    const uploadFlow = flowRateFilter.transform(upload);

    const option = {
      color: colors,
      title: {
        text: __('Station Flow'),
        left: '45%',
        textStyle: {
          fontWeight: 'normal',
          fontSize: '18',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        y: 'bottom',
        data: [`${__('Download')}: ${downloadFlow}`, `${__('Upload')}: ${uploadFlow}`],
      },
      series: [
        {
          name: __('Flow'),
          type: 'pie',
          radius: '50%',
          center: ['60%', '55%'],
          label: {
            normal: { show: false },
          },
          data: [
            { value: download, name: `${__('Download')}: ${downloadFlow}` },
            { value: upload, name: `${__('Upload')}: ${uploadFlow}` },
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    return option;
  }

  prepareChartData() { // { ssidFlowDir, top10ClientFlowDir }为流量方向，'upload','download'
    const customSetings = this.props.selfState.get('customSettingsForChart').toJS();
    const { radioId /* , radioType */ } = this.props.selfState.get('currRadioConfig').toJS();
    if (!this.props.store.getIn(['curData', 'radioList', radioId]) ||
        !this.props.store.getIn(['curData', 'sysStatus'])) return null;
    const { cpuInfo, memTotal, memFree } = this.props.store.getIn(['curData', 'sysStatus']).toJS();
    const that = this;
    function getFlowPerSsidList() {
      const vapList = that.props.store.getIn(['curData', 'radioList', radioId, 'vapList']);
      let flowPerSsid;
      if (customSetings.ssidFlowDir === 'upload') {
        flowPerSsid = vapList.map(item => fromJS({
          name: item.get('ssid'),
          value: Number(item.get('txBytes')),
        }));
      } else if (customSetings.ssidFlowDir === 'download') {
        flowPerSsid = vapList.map(item => fromJS({
          name: item.get('ssid'),
          value: Number(item.get('rxBytes')),
        }));
      }
      return flowPerSsid;
    }
    function getTop10FlowClientsList() {
      const staList = that.props.store.getIn(['curData', 'radioList', radioId, 'staList']);
      let sortedStaList;
      let top10FlowClients;
      if (customSetings.top10ClientFlowDir === 'upload') { // 排序
        sortedStaList = staList.sort((itemA, itemB) => {
          const txBytesA = Number(itemA.get('txBytes'));
          const txBytesB = Number(itemB.get('txBytes'));
          return txBytesB - txBytesA;
        });
      } else if (customSetings.top10ClientFlowDir === 'download') {
        sortedStaList = staList.sort((itemA, itemB) => {
          const rxBytesA = Number(itemA.get('rxBytes'));
          const rxBytesB = Number(itemB.get('rxBytes'));
          return rxBytesB - rxBytesA;
        });
      }
      if (sortedStaList.size > 10) { // 裁剪前十
        sortedStaList = sortedStaList.slice(0, 10);
      }
      if (customSetings.top10ClientFlowDir === 'upload') {
        top10FlowClients = sortedStaList.map(item => fromJS({
          name: item.get('deviceName'),
          value: Number(item.get('txBytes')),
          mac: item.get('mac'), // 如果客户端没有名称，则使用mac代替
        }));
      } else if (customSetings.top10ClientFlowDir === 'download') {
        top10FlowClients = sortedStaList.map(item => fromJS({
          name: item.get('deviceName'),
          value: Number(item.get('rxBytes')),
          mac: item.get('mac'),
        }));
      }
      return top10FlowClients;
    }
    const { ssidFlowDir, top10ClientFlowDir } = this.props.selfState.get('customSettingsForChart').toJS();
    const flowPerSsid = getFlowPerSsidList(ssidFlowDir);
    const top10FlowClients = getTop10FlowClientsList(top10ClientFlowDir);
    this.props.changeServerData(fromJS({
      cpuInfo, memFree, memTotal, flowPerSsid, top10FlowClients,
    }));
  }

  render() {
    const { radioId /* , radioType */} = this.props.selfState.get('currRadioConfig').toJS();
    if (!this.props.store.getIn(['curData', 'radioList', radioId])
        || !this.props.store.getIn(['curData', 'sysStatus'])) return null;
    const {
      /* deviceModel, deviceName, */ version, uptime, systemTime, networkMode, systemMac,
    } = this.props.store.getIn(['curData', 'sysStatus']).toJS();
    const interfaces = this.props.store.getIn(['curData', 'interfaces']);
    const { wirelessMode, staList, enable } = this.props.store.getIn(['curData', 'radioList', radioId]).toJS();
    const routerInfo = this.props.store.getIn(['curData', 'sysStatus', 'routerInfo']);
    const switchInfo = this.props.store.getIn(['curData', 'sysStatus', 'switchInfo']);
    const radioList = this.props.store.getIn(['curData', 'radioList']);
    const peerList = this.props.store.getIn(['curData', 'radioList', radioId, 'peerList']);
    const radioSelectOptions = this.props.product.get('radioSelectOptions');
    const serverData = this.props.selfState.get('serverData');
    const topTenFlowClients = getTopTenFlowClientsOption(serverData);
    const flowPerSsid = getFlowPerSsidOption(serverData);
    const cpuAndMemUsage = this.getCpuAndMemPercentOption();

    return (
      <div className="o-box" style={{ minWidth: '1000px' }}>
        <div className="row" style={{ minWidth: '1000px' }}>
          <div className="cols col-3" style={{ minWidth: '250px' }}>
            <div className="o-box__cell">
              <h3>{__('Network Info')}</h3>
            </div>
            <div
              className="o-box__cell"
              style={{
                height: '217px',
              }}
            >
              {
                networkMode === 'switch' ? (
                  <div className="o-description-list o-description-list--lg info-box">
                    <dl className="o-description-list-row">
                      <dt>{__('Network Mode')}</dt>
                      <dd>{networkMode}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('IP Mode')}</dt>
                      <dd>{switchInfo ? switchInfo.get('proto') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('IP Address')}</dt>
                      <dd>{switchInfo ? switchInfo.get('ip') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('Subnet Mask')}</dt>
                      <dd>{switchInfo ? switchInfo.get('mask') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('Gateway')}</dt>
                      <dd>{switchInfo ? switchInfo.get('gateway') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('Primary DNS')}</dt>
                      <dd>{switchInfo ? switchInfo.get('dns1') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('Secondary DNS')}</dt>
                      <dd>{switchInfo ? switchInfo.get('dns2') : ''}</dd>
                    </dl>
                  </div>
                ) : (
                  <div className="o-description-list o-description-list--lg info-box">
                    <dl className="o-description-list-row">
                      <dt>{__('Network Mode')}</dt>
                      <dd>{networkMode}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('WAN IP Mode')}</dt>
                      <dd>{routerInfo ? routerInfo.get('proto') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('WAN IP')}</dt>
                      <dd>{routerInfo ? routerInfo.get('wanIp') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('Gateway')}</dt>
                      <dd>{routerInfo ? routerInfo.get('gateway') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('Mask')}</dt>
                      <dd>{routerInfo ? routerInfo.get('wanMask') : ''}</dd>
                    </dl>
                    <dl className="o-description-list-row">
                      <dt>{__('NAT Enable')}</dt>
                      <dd>{routerInfo && routerInfo.get('nat') === '1' ? __('Enable') : __('Disabled')}</dd>
                    </dl>
                  </div>
                )
              }
            </div>
          </div>
          <div className="cols col-9">
            <div className="o-box__cell">
              <h3>{__('System Status')}</h3>
            </div>
            <div
              className="o-box__cell cols col-6"
              style={{
                height: '217px',
                minWidth: '300px',
              }}
            >
              <div className="o-description-list o-description-list--lg info-box">
                {/** *********************************************************
                <dl className="o-description-list-row">
                  <dt>{__('Device Model')}</dt>
                  <dd>{deviceModel}</dd>
                </dl>
                <dl className="o-description-list-row">
                  <dt>{__('Device Name')}</dt>
                  <dd>{deviceName}</dd>
                </dl>
                **************************************************************/}
                <dl className="o-description-list-row">
                  <dt>{__('Firmware Version')}</dt>
                  <dd>{version}</dd>
                </dl>
                <dl className="o-description-list-row">
                  <dt>{__('System Uptime')}</dt>
                  <dd>{changeUptimeToReadable(uptime)}</dd>
                </dl>
                <dl className="o-description-list-row">
                  <dt>{__('System Time')}</dt>
                  <dd>{systemTime}</dd>
                </dl>
                <dl className="o-description-list-row">
                  <dt>{__('MAC Address')}</dt>
                  <dd>{systemMac}</dd>
                </dl>
              </div>
            </div>
            <div className="cols col-6 o-box__cell" style={{ minWidth: '300px' }}>
              <EchartReact
                className="o-box__canvas"
                option={cpuAndMemUsage}
                style={{
                  minHeight: '200px',
                  minWidth: '300px',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>

        <div className="row" style={{ minWidth: '1000px' }}>
          <div className="cols col-12">
            <div className="o-box__cell clearfix">
              {
                this.props.product.get('deviceRadioList').size > 1 ? (
                  <FormInput
                    type="switch"
                    label={__('Radio Select')}
                    minWidth="100px"
                    options={radioSelectOptions}
                    value={this.props.selfState.getIn(['currRadioConfig', 'radioId'])}
                    onChange={(data) => {
                      Promise.resolve().then(() => {
                        this.onChangeRadio(data);
                      }).then(() => {
                        if (this.props.store.getIn(['curData', 'radioList', data.value, 'enable']) === '1') {
                          this.prepareChartData();
                        }
                      });
                    }}
                  />
                ) : null
              }
            </div>
          </div>
          <div
            className="cols col-3 o-box__cell"
            style={{
              height: '287px',
              minWidth: '250px',
            }}
          >
            <div className="box-cell-head">{__('Radio Info')}</div>
            <div className="o-description-list o-description-list--lg info-box">
              <dl className="o-description-list-row">
                <dt>{__('Radio Mode')}</dt>
                <dd>{wirelessModeShowStyle(radioList.getIn([radioId, 'wirelessMode']))}</dd>
              </dl>
              <dl className="o-description-list-row">
                <dt>{__('Wireless Mode')}</dt>
                <dd>{radioList.getIn([radioId, 'radioMode'])}</dd>
              </dl>
              <dl className="o-description-list-row">
                <dt>{__('Channel Bandwidth')}</dt>
                <dd>{radioList.getIn([radioId, 'channelWidth'])}</dd>
              </dl>
              <dl className="o-description-list-row">
                <dt>{__('Channel/Frequency')}</dt>
                <dd>{`${radioList.getIn([radioId, 'channel'])}/${radioList.getIn([radioId, 'frequency'])}`}</dd>
              </dl>
              <dl className="o-description-list-row">
                <dt>{__('Channel Utilization')}</dt>
                <dd>{radioList.getIn([radioId, 'chutil'])}</dd>
              </dl>
              {
                wirelessMode !== 'sta' && typeof (staList) !== 'undefined' ? (
                  <dl className="o-description-list-row">
                    <dt>{__('Client Number')}</dt>
                    <dd>{staList.length}</dd>
                  </dl>
                ) : null
              }
              <dl className="o-description-list-row">
                <dt>{__('Tx Power')}</dt>
                <dd style={{ whiteSpace: 'pre' }}>{modifySignalShowStyle(radioList.getIn([radioId, 'txPower']))}</dd>
              </dl>
              {
                wirelessMode === 'sta' ? (
                  <dl className="o-description-list-row">
                    <dt>{__('Signal')}</dt>
                    <dd style={{ whiteSpace: 'pre' }}>{modifySignalShowStyle(radioList.getIn([radioId, 'signal']))}</dd>
                  </dl>
                ) : null
              }
              <dl className="o-description-list-row">
                <dt>{__('Noise')}</dt>
                <dd style={{ whiteSpace: 'pre' }}>{modifySignalShowStyle(radioList.getIn([radioId, 'noise']))}</dd>
              </dl>
            </div>
          </div>

          <div className="cols col-9">
            {
              wirelessMode !== 'sta' && enable === '1' && staList.length > 0 ? (
                <div
                  className="cols col-6 o-box__cell"
                  style={{
                    position: 'relative',
                    minWidth: '300px',
                  }}
                >
                  <FormInput
                    type="switch"
                    options={[
                      { value: 'download', label: __('Download') },
                      { value: 'upload', label: __('Upload') },
                    ]}
                    minWidth="84px"
                    style={{
                      position: 'absolute',
                      right: '0',
                      bottom: '0',
                      zIndex: '99',
                    }}
                    value={this.props.selfState.getIn(['customSettingsForChart', 'top10ClientFlowDir'])}
                    onChange={(data) => {
                      Promise.resolve().then(() => {
                        this.props.changeCustomSettingsForChart(fromJS({
                          top10ClientFlowDir: data.value,
                        }));
                      }).then(() => {
                        if (this.props.store.getIn(['curData', 'radioList', radioId, 'enable']) === '1') {
                          this.prepareChartData();
                        }
                      });
                    }}
                  />
                  <div
                    style={{
                      minWidth: '300px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        right: '5px',
                        top: '5px',
                        zIndex: '99',
                        color: 'blue',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        const radioTypeVal = this.props.product.getIn(['deviceRadioList', radioId, 'radioType']);
                        const config = fromJS({
                          radioId,
                          radioType: radioTypeVal,
                        });
                        this.props.changeCurrRadioConfig(config);
                        window.location.href = '#/main/status/clientsdetails';
                      }}
                    >
                      {__('More Details >>')}
                    </span>
                    <EchartReact
                      option={topTenFlowClients}
                      className="o-box__canvas"
                      style={{
                        minHeight: '270px',
                        minWidth: '300px',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="cols col-6 o-box__cell">
                  {
                    wirelessMode === 'sta' ? (
                      <div style={{ minHeight: '270px' }}>
                        <div className="box-cell-head">{__('Remote Client Info')}</div>
                        <div className="o-description-list o-description-list--lg info-box">
                          <dl className="o-description-list-row">
                            <dt>{__('Connection Status')}</dt>
                            <dd>{__(peerList.getIn([0, 'status'])) || __('Disconnected')}</dd>
                          </dl>
                          <dl className="o-description-list-row">
                            <dt>{__('Remote SSID')}</dt>
                            <dd>{peerList.getIn([0, 'ssid']) || '--'}</dd>
                          </dl>
                          <dl className="o-description-list-row">
                            <dt>{__('Peer MAC')}</dt>
                            <dd>{peerList.getIn([0, 'mac']) || '--'}</dd>
                          </dl>
                          <dl className="o-description-list-row">
                            <dt>{__('Connect Time')}</dt>
                            <dd>{changeUptimeToReadable(peerList.getIn([0, 'connectTime'])) || '--'}</dd>
                          </dl>
                          <dl className="o-description-list-row">
                            <dt>{__('Tx Rate')}</dt>
                            <dd>{peerList.getIn([0, 'txrate']) ? `${__(peerList.getIn([0, 'txrate']))} Mbps` : '--'}</dd>
                          </dl>
                          <dl className="o-description-list-row">
                            <dt>{__('Rx Rate')}</dt>
                            <dd>{peerList.getIn([0, 'rxrate']) ? `${__(peerList.getIn([0, 'rxrate']))} Mbps` : '--'}</dd>
                          </dl>
                        </div>
                      </div>
                    ) : (
                      <div className="radio-off-notice">{__('No Client')}</div>
                    )
                  }
                </div>
              )
            }

            <div
              className="cols col-6 o-box__cell"
              style={{
                position: 'relative',
                minWidth: '300px',
              }}
            >
              {
                enable === '0' ? (
                  <div className="radio-off-notice">{__('Radio Off')}</div>
                ) : (
                  <div>
                    {
                      wirelessMode !== 'sta' ? (
                        <div>
                          <FormInput
                            type="switch"
                            options={[
                              { value: 'download', label: __('Download') },
                              { value: 'upload', label: __('Upload') },
                            ]}
                            minWidth="84px"
                            style={{
                              position: 'absolute',
                              right: '0',
                              bottom: '0',
                              zIndex: '99',
                            }}
                            value={this.props.selfState.getIn(['customSettingsForChart', 'ssidFlowDir'])}
                            onChange={(data) => {
                              Promise.resolve().then(() => {
                                this.props.changeCustomSettingsForChart(fromJS({
                                  ssidFlowDir: data.value,
                                }));
                              }).then(() => {
                                if (this.props.store.getIn(['curData', 'radioList', radioId, 'enable']) === '1') {
                                  this.prepareChartData();
                                }
                              });
                            }}
                          />
                          <div
                            style={{
                              minWidth: '300px',
                              positon: 'relative',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                right: '5px',
                                top: '10px',
                                zIndex: '99',
                                color: 'blue',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                const radioTypeVal = this.props.product.getIn(['deviceRadioList', radioId, 'radioType']);
                                const config = fromJS({
                                  radioId,
                                  radioType: radioTypeVal,
                                });
                                this.props.changeCurrRadioConfig(config);
                                window.location.href = '#/main/status/ssiddetails';
                              }}
                            >
                              {__('More Details >>')}
                            </span>
                            <EchartReact
                              className="o-box__canvas"
                              option={flowPerSsid}
                              style={{
                                minHeight: '270px',
                                minWidth: '300px',
                                width: '100%',
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ minWidth: '300px' }}>
                          <EchartReact
                            className="o-box__canvas"
                            option={this.getStaPeerFlowOption()}
                            style={{
                              minHeight: '270px',
                              minWidth: '300px',
                              width: '100%',
                            }}
                          />
                        </div>
                      )
                    }
                  </div>
                )
              }


            </div>
          </div>
        </div>

        <div>
          <div className="o-box__cell">
            <h3>{__('Ethernet')}</h3>
          </div>
          <div className="o-box__cell">
            <Table
              options={interfaceOptions}
              list={interfaces}
            />
          </div>
        </div>

        {/*
          wirelessMode === 'sta' ? (
            <div className="remoteApTable o-box">
              <div className="o-box__cell">
                <h3>{__('Connection Info')}</h3>
              </div>
              <div className="o-box__cell">
                <Table
                  className="table"
                  options={connectionInfoOption}
                  list={peerList}
                />
              </div>
            </div>
          ) : null
        */}

        {
          this.props.app.get('fetching') && this.props.selfState.get('firstRefresh') ? (
            <div className="o-modal" role="message">
              <div className="o-modal__backdrop" />
              <div className="o-modal__message">
                <div className="o-modal__content">
                  <div className="o-modal__clarbody">
                    <h3>Axilspot</h3>
                    <span className="fa fa-spinner fa-spin" style={{ color: '#0093dd', marginLeft: '5px' }} />
                  </div>
                </div>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
}

SystemStatus.propTypes = propTypes;
SystemStatus.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    selfState: state.systemstatus,
    app: state.app,
    store: state.settings,
    product: state.product,
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
)(SystemStatus);

export const systemstatus = reducer;
