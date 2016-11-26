import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';
import { FormGroup, Button, EchartReact, FormInput } from 'shared/components';
import Table from 'shared/components/Table';
import utils from 'shared/utils';
import * as sharedActions from 'shared/actions/settings';
import * as appActions from 'shared/actions/app';
import * as selfActions from './actions';
import reducer from './reducer';

const flowRateFilter = utils.filter('flowRate');
const propTypes = {
  store: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  product: PropTypes.instanceOf(Map),
  selfState: PropTypes.instanceOf(Map),
  initSettings: PropTypes.func,
  fetchSettings: PropTypes.func,
  changeCurrRadioConfig: PropTypes.func,
  changeCustomSettingsForChart: PropTypes.func,

  updateItemSettings: PropTypes.func,
  leaveSettingsScreen: PropTypes.func,
  app: PropTypes.instanceOf(Map),
  changeFirstRefresh: PropTypes.func,
  changeServerData: PropTypes.func,
};
let a;
const defaultProps = {};
const interfaceOptions = fromJS([
  {
    id: 'name',
    text: _('Name'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '152px',
  }, {
    id: 'mac',
    text: _('MAC'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '152px',
  }, {
    id: 'txBytes',
    text: _('Tx Bytes'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return flowRateFilter.transform(val);
    },
    width: '144px',
  }, {
    id: 'rxBytes',
    text: _('Rx Bytes'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return flowRateFilter.transform(val);
    },
    width: '144px',
  }, {
    id: 'txPackets',
    text: _('Tx Packets'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'rxPackets',
    text: _('Rx Packets'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'txErrorPackets',
    text: _('Tx Error'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'rxErrorPackets',
    text: _('Rx Error'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
    width: '144px',
  }, {
    id: 'status',
    text: _('Status'),
    transform(val) {
      if (val === '') {
        return '--';
      }
      return val;
    },
  },
]);
// const vapInterfaceOptions = fromJS([
//   {
//     id: 'name',
//     text: _('Name'),
//     transform(val, item) {
//       const ssid = item.get('ssid');
//       if (val === '') {
//         return `--(${ssid})`;
//       }
//       return `${val}(${ssid })`;
//     },
//     width: '152px',
//   }, {
//     id: 'mac',
//     text: _('MAC'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return val;
//     },
//     width: '152px',
//   }, {
//     id: 'txBytes',
//     text: _('Tx Bytes'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return flowRateFilter.transform(val);
//     },
//     width: '144px',
//   }, {
//     id: 'rxBytes',
//     text: _('Rx Bytes'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return flowRateFilter.transform(val);
//     },
//     width: '144px',
//   }, {
//     id: 'txPackets',
//     text: _('Tx Packets'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return val;
//     },
//     width: '144px',
//   }, {
//     id: 'rxPackets',
//     text: _('Rx Packets'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return val;
//     },
//     width: '144px',
//   }, {
//     id: 'txErrorPackets',
//     text: _('Tx Error'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return val;
//     },
//     width: '144px',
//   }, {
//     id: 'rxErrorPackets',
//     text: _('Rx Error'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return val;
//     },
//     width: '144px',
//   }, {
//     id: 'ccq',
//     text: _('CCQ'),
//     transform(val) {
//       if (val === '') {
//         return '--';
//       }
//       return val;
//     },
//   },
// ]);
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

function getCpuOption(serverData) {
  const ret = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {d}%',
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      data: [_('Used'), _('Free')],
    },
    title: {
      text: _('CPU Usage'),
      x: 'center',
    },
    series: [
      {
        name: _('CPU Usage'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center',
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '20',
              fontWeight: 'bold',
            },
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },

      },
    ],
  };

  ret.series[0].data = [
    { value: serverData.get('cpuInfo'), name: _('Used') },
    { value: serverData.get('cpuTotal') - serverData.get('cpuInfo'), name: _('Free') },
  ];

  return ret;
}
function getMemoryOption(serverData) {
  const ret = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}KB ({d}%)',
    },
    title: {
      text: _('Memory Usage'),
      x: 'center',
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      data: [_('Used'), _('Free')],
    },
    series: [
      {
        name: _('Memory Usage'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center',
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '20',
              fontWeight: 'bold',
            },
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
      },
    ],
  };

  ret.series[0].data = [
    { value: serverData.get('memTotal') - serverData.get('memFree'), name: _('Used') },
    { value: serverData.get('memFree'), name: _('Free') },
  ];

  return ret;
}
function getFlowPerSsidOption(serverData) {
  let dataList = serverData.get('flowPerSsid');
  let totalNum = 0;
  dataList.forEach((item) => {
    totalNum += Number(item.get('value'));
  });
  const ret = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} ({d}%)',
    },
    title: {
      text: _('Total: ') + totalNum,
      x: 'center',
      textStyle: {
        fontSize: '18',
      },
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      y: 'top',
    },
    series: [
      {
        name: 'SSID',
        type: 'pie',
        radius: ['0%', '60%'],
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
function getTopTenFlowClientsOption(serverData) {
  let dataList = serverData.get('top10FlowClients');
  const ret = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} ({d}%)',
    },
    title: {
      text: _('Top10 Flow Clients'),
      x: 'center',
    },
    legend: {
      show: true,
      orient: 'vertical',
      x: 'left',
      y: 'top',
      // data: [_('Offline'), _('Online')],
    },
    series: [
      {
        name: _('Name'),
        type: 'pie',
        radius: ['0%', '60%'],
        avoidLabelOverlap: false,
        label: {
          // formatter: '{b}: {c}',
          normal: {
            show: false,
            //position: 'center',
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
        },
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
    // console.log('rat.legend.data2', ret.legend.data, dataList);
    ret.series[0].data = dataList.toJS();
  }

  return ret;
}

export default class SystemStatus extends React.Component {
  constructor(props) {
    super(props);
    // this.changeUptimeToReadable = this.changeUptimeToReadable.bind(this);
    this.onChangeRadio = this.onChangeRadio.bind(this);
    this.prepareChartData = this.prepareChartData.bind(this);
  }

  componentWillMount() {
    clearInterval(a);
    // 必须要有初始化，因为要在settings中插入一个由该页面id命名的对象
    this.props.initSettings({
      settingId: this.props.route.id,
      fetchUrl: this.props.route.fetchUrl,
      defaultData: {},
    });
    // console.log('this.props.product.getIn([deviceRadioList, 0])', this.props.product.getIn(['deviceRadioList', 0]));
    // this.props.changeCurrRadioConfig(this.props.product.getIn(['deviceRadioList', 0]));
    this.props.fetchSettings().then(() => {
      this.props.changeFirstRefresh(false);
      // const customSetings = this.props.selfState.get('customSettingsForChart').toJS();
      this.prepareChartData();
    });
    this.onChangeRadio({ value: 0 });
    a = setInterval(() => {
      this.props.fetchSettings().then(() => {
        this.prepareChartData();
      });
    }, 10000);
  }


  // componentDidMount() {
  //   console.log(this.props.product.getIn(['deviceRadioList', 0]));
  //   this.props.changeCurrRadioConfig(this.props.product.getIn(['deviceRadioList', 0]));
  // }

  componentDidUpdate(prevProps) {
    // console.log('app.refreshAt', this.props.app.get('refreshAt'));
    // console.log('prevProps.app.refreshAt', prevProps.app.get('refreshAt'));
    if (this.props.app.get('refreshAt') !== prevProps.app.get('refreshAt')) {
      // console.log('refresh');
      clearInterval(a);
      this.props.fetchSettings();
      this.onChangeRadio({ value: 0 });
      a = setInterval(this.props.fetchSettings, 10000);
    }
  }

  componentWillUnmount() {
    // console.log('interval', a);
    clearInterval(a);
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

  prepareChartData() { // { ssidFlowDir, top10ClientFlowDir }为流量方向，'upload','download'
    const customSetings = this.props.selfState.get('customSettingsForChart').toJS();
    const { radioId, radioType } = this.props.selfState.get('currRadioConfig').toJS();
    const { cpuInfo, memTotal, memFree } = this.props.store.getIn(['curData', 'sysStatus']).toJS();
    const that = this;
    function getFlowPerSsidList() {
      const vapList = that.props.store.getIn(['curData', 'radioList', radioId, 'vapList']);
      let flowPerSsid;
      if (customSetings.ssidFlowDir === 'upload') {
        flowPerSsid = vapList.map(item => fromJS({
          name: item.get('ssid'),
          value: Number(item.get('rxBytes')),
        }));
      } else if (customSetings.ssidFlowDir === 'download') {
        flowPerSsid = vapList.map(item => fromJS({
          name: item.get('ssid'),
          value: Number(item.get('txBytes')),
        }));
      }
      return flowPerSsid;
    }
    function getTop10FlowClientsList() {
      const staList = that.props.store.getIn(['curData', 'radioList', radioId, 'staList']);
      // console.log('staList', staList);
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
      // console.log('sortedStaList', sortedStaList);
      if (sortedStaList.size > 10) { // 裁剪前十
        sortedStaList = sortedStaList.slice(0, 10);
      }
      if (customSetings.top10ClientFlowDir === 'upload') {
        top10FlowClients = sortedStaList.map(item => fromJS({
          name: item.get('deviceName'),
          value: Number(item.get('txBytes')),
        }));
      } else if (customSetings.top10ClientFlowDir === 'download') {
        top10FlowClients = sortedStaList.map(item => fromJS({
          name: item.get('deviceName'),
          value: Number(item.get('rxBytes')),
        }));
      }
      // console.log('top10FlowClients', top10FlowClients);
      return top10FlowClients;
    }
    const { ssidFlowDir, top10ClientFlowDir } = this.props.selfState.get('customSettingsForChart').toJS();
    const flowPerSsid = getFlowPerSsidList(ssidFlowDir);
    const top10FlowClients = getTop10FlowClientsList(top10ClientFlowDir);
    this.props.changeServerData(fromJS({ cpuInfo, memFree, memTotal, flowPerSsid, top10FlowClients }));
  }

  render() {
    // const clientOptions = fromJS([
    //   {
    //     id: 'mac',
    //     text: 'Mac',
    //   },
    //   {
    //     id: 'deviceName',
    //     text: _('Device Name'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    //   {
    //     id: 'ssid',
    //     text: _('Owner SSID'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    //   {
    //     id: 'signal',
    //     text: _('Signal(dBm)'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    //   {
    //     id: 'noise',
    //     text: _('Noise(dBm)'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    //   {
    //     id: 'txRate',
    //     text: _('Tx Rate'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return `${val}Mbps`;
    //     },
    //   },
    //   {
    //     id: 'rxRate',
    //     text: _('Rx Rate'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return `${val}Mbps`;
    //     },
    //   },
    //   {
    //     id: 'txBytes',
    //     text: _('Tx Bytes'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return flowRateFilter.transform(val);
    //     },
    //   },
    //   {
    //     id: 'rxBytes',
    //     text: _('Rx Bytes'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return flowRateFilter.transform(val);
    //     },
    //   },
    //   {
    //     id: 'txPackets',
    //     text: _('Tx Packets'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    //   {
    //     id: 'rxPackets',
    //     text: _('Rx Packets'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    //   {
    //     id: 'connectTime',
    //     text: _('Connect Time'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return changeUptimeToReadable(val);
    //     },
    //   },
    //   {
    //     id: 'ipAddr',
    //     text: _('IP'),
    //     transform(val) {
    //       if (val === '' || val === undefined) {
    //         return '--';
    //       }
    //       return val;
    //     },
    //   },
    // ]);
    const connectionInfoOption = fromJS([
      {
        id: 'status',
        text: _('Connection Status'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      }, {
        id: 'connectTime',
        text: _('Connect Time'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return changeUptimeToReadable(val);
        },
      }, {
        id: 'txrate',
        text: _('Tx Rate'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return `${val}Mbps`;
        },
      }, {
        id: 'rxrate',
        text: _('Rx Rate'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return `${val}Mbps`;
        },
      }, {
        id: 'ip',
        text: _('Peer IP'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
    ]);
    const { radioId, radioType } = this.props.selfState.get('currRadioConfig').toJS();
    if (!this.props.store.getIn(['curData', 'radioList', radioId])
        || !this.props.store.getIn(['curData', 'sysStatus'])) return null;
    const {
      deviceModel, deviceName, version, uptime, systemTime, networkMode,
      lan0Mac, lan1Mac, wlan0Mac,
    } = this.props.store.getIn(['curData', 'sysStatus']).toJS();
    const interfaces = this.props.store.getIn(['curData', 'interfaces']).toJS();
    const {
      wirelessMode, security, frequency, channelWidth, channel, protocol, ssid,
      distance, txPower, noise, chutil, staList, peerList, vapList, signal,
    } = this.props.store.getIn(['curData', 'radioList', radioId]).toJS();
    const vapInterfacesList = (wirelessMode === 'sta') ? [vapList[0]] : vapList;
    // 绘图
    const serverData = this.props.selfState.get('serverData');
    const memoryStatusOption = getMemoryOption(serverData);
    const cpuStatusOption = getCpuOption(serverData);
    const topTenFlowClients = getTopTenFlowClientsOption(serverData);
    const flowPerSsid = getFlowPerSsidOption(serverData);

    return (
      <div>
        {
          this.props.product.get('deviceRadioList').size > 1 ? (
            <FormInput
              type="switch"
              label={_('Radio Select')}
              minWidth="100px"
              options={this.props.product.get('radioSelectOptions')}
              value={this.props.selfState.getIn(['currRadioConfig', 'radioId'])}
              onChange={(data) => {
                Promise.resolve().then(() => {
                  this.onChangeRadio(data);
                }).then(() => {
                  this.prepareChartData();
                });
              }}
              style={{
                marginBottom: '15px',
              }}
            />
          ) : null
        }
        { // <h3 className="t-main__content-title">{_('System Status') }</h3>
        }

        <div className="o-box row">
          <div className="cols col-6" >
            <div className="o-box__cell">
              <h3>{ _('Memory') }</h3>
            </div>
            <div className="o-box__cell">
              <EchartReact
                option={memoryStatusOption}
                className="o-box__canvas"
                style={{
                  width: '100%',
                  minHeight: '200px',
                }}
              />
            </div>
          </div>
          <div className="cols col-6">
            <div className="o-box__cell">
              <h3>{ _('CPU') }</h3>
            </div>
            <div className="o-box__cell">
              <EchartReact
                option={cpuStatusOption}
                className="o-box__canvas"
                style={{
                  width: '100%',
                  minHeight: '200px',
                }}
              />
            </div>
          </div>
        </div>

        {
          wirelessMode === 'sta' ? null : (
            <div className="o-box row">
              <div className="cols col-6" >
                <div className="o-box__cell clearfix">
                  <h3
                    className="fl"
                    style={{
                      paddingTop: '5px',
                      marginRight: '10px',
                    }}
                  >
                    { _('SSID Flow') }
                  </h3>
                  <FormInput
                    type="select"
                    options={[
                      { label: 'Upload', value: 'upload' },
                      { label: 'Download', value: 'download' },
                    ]}
                    value={this.props.selfState.getIn(['customSettingsForChart', 'ssidFlowDir'])}
                    onChange={(data) => {
                      Promise.resolve().then(() => {
                        this.props.changeCustomSettingsForChart(fromJS({ ssidFlowDir: data.value }));
                      }).then(() => {
                        this.prepareChartData();
                      });
                    }}
                  />
                  <a
                    href="#/main/status/ssiddetails"
                    className="fr"
                    style={{
                      paddingTop: '5px',
                    }}
                  >
                    {_('More Details')}
                  </a>
                </div>
                <div className="o-box__cell">
                  <EchartReact
                    option={flowPerSsid}
                    className="o-box__canvas"
                    style={{
                      width: '100%',
                      minHeight: '260px',
                    }}
                  />
                </div>
              </div>
              <div className="cols col-6">
                <div className="o-box__cell clearfix">
                  <h3
                    className="fl"
                    style={{
                      paddingTop: '5px',
                      marginRight: '10px',
                    }}
                  >
                    { _('Top10 Flow Clients') }
                  </h3>
                  <FormInput
                    type="select"
                    options={[
                      { label: 'Upload', value: 'upload' },
                      { label: 'Download', value: 'download' },
                    ]}
                    value={this.props.selfState.getIn(['customSettingsForChart', 'top10ClientFlowDir'])}
                    onChange={(data) => {
                      Promise.resolve().then(() => {
                        this.props.changeCustomSettingsForChart(fromJS({ top10ClientFlowDir: data.value }));
                      }).then(() => {
                        this.prepareChartData();
                      });
                    }}
                  />
                  <a
                    href="#/main/status/clientsdetails"
                    className="fr"
                    style={{
                      paddingTop: '5px',
                    }}
                  >
                    {_('More Details')}
                  </a>
                </div>
                <div className="o-box__cell row">
                  {
                  // <div
                  //   className="cols col-4"
                  //   style={{
                  //     paddingRight: '6px',
                  //   }}
                  // >
                  //     <h3
                  //     style={{
                  //       fontSize: '18px',
                  //       lineHeight: '30px',
                  //       textAlign: 'center',
                  //       fontWeight: '400',
                  //     }}
                  //   >{_('Online Number')}</h3>

                  //   <p
                  //     style={{
                  //       fontSize: '30px',
                  //       marginTop: '10px',
                  //       padding: '56px 0',
                  //       textAlign: 'center',
                  //       color: 'green',
                  //       border: '1px solid #e5e5e5',
                  //     }}
                  //   >
                  //     {serverData.get('clientsNumber') || 0}
                  //   </p>
                  // </div>
                  }
                  <EchartReact
                    option={topTenFlowClients}
                    className="o-box__canvas cols col-12"
                    style={{
                      minHeight: '260px',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        }

        <div className="stats-group">
          <div className="stats-group-cell">
            <h3>{_('System Status')}</h3>
          </div>
          <div className="stats-group-cell">
            <div className="row">
              <div className="cols col-5">
                <FormGroup
                  type="plain-text"
                  label={_('Device Model :')}
                  value={deviceModel}
                />
                <FormGroup
                  label={_('Network Mode :')}
                  type="plain-text"
                  value={networkMode}
                />
                <FormGroup
                  label={_('System Uptime :')}
                  id="uptime"
                  type="plain-text"
                  value={changeUptimeToReadable(uptime)}
                />
                <FormGroup
                  label={_('WLAN0 MAC :')}
                  type="plain-text"
                  value={wlan0Mac}
                />
                <FormGroup
                  label={_('LAN1 MAC :')}
                  type="plain-text"
                  value={lan1Mac}
                />

              </div>
              <div className="cols col-6">
                <FormGroup
                  label={_('Device Name :')}
                  type="plain-text"
                  value={deviceName}
                />
                <FormGroup
                  label={_('Firmware Version :')}
                  type="plain-text"
                  value={version}
                />
                <FormGroup
                  label={_('System Time :')}
                  id="systemtime"
                  type="plain-text"
                  value={systemTime}
                />
                <FormGroup
                  label={_('LAN0 MAC :')}
                  type="plain-text"
                  value={lan0Mac}
                />
                {
                  wirelessMode !== 'sta' ? (
                    <FormGroup
                      label={_('Client Number :')}
                      id="userNumber"
                      type="plain-text"
                      value={staList.length}
                    />
                  ) : null
                }
              </div>
            </div>
          </div>

          <div className="stats-group-cell">
            <h3>{_('Radio')}</h3>
          </div>
          <div className="stats-group-cell">
            <div className="row">
              <div className="cols col-5">
                <FormGroup
                  label={_('Wireless Model :')}
                  type="plain-text"
                  value={wirelessMode === 'sta' ? 'station' : wirelessMode}
                />
                <FormGroup
                  label={_('SSID :')}
                  type="plain-text"
                  value={ssid}
                />
                <FormGroup
                  label={_('Protocol :')}
                  type="plain-text"
                  value={protocol}
                />
                <FormGroup
                  label={_('Channel/Frequency :')}
                  type="plain-text"
                  value={`${channel}/${frequency}`}
                />
                <FormGroup
                  label={_('Channel Width :')}
                  type="plain-text"
                  value={channelWidth}
                />
                <FormGroup
                  label={_('Security Mode :')}
                  type="plain-text"
                  value={security}
                />
              </div>
              <div className="cols col-6">
                <FormGroup
                  label={_('Distance :')}
                  type="plain-text"
                  value={distance}
                  help="km"
                />
                <FormGroup
                  label={_('Tx Power :')}
                  type="plain-text"
                  value={txPower}
                  help="dBm"
                />
                <FormGroup
                  label={_('Signal :')}
                  type="plain-text"
                  value={signal}
                  help="dBm"
                />
                <FormGroup
                  label={_('Noise :')}
                  type="plain-text"
                  value={noise}
                  help="dBm"
                />
                <FormGroup
                  label={_('Channel Utilization :')}
                  type="plain-text"
                  value={chutil}
                />
              </div>
            </div>
          </div>

          <h3 className="stats-group-cell">{_('Wired Interfaces')}</h3>
          <div className="stats-group-cell">
            <Table
              className="table"
              options={interfaceOptions}
              list={interfaces}
            />
          </div>
          {
            // <h3 className="stats-group-cell">{_('Wireless Interfaces')}</h3>
            // <div className="stats-group-cell">
            //   <Table
            //     className="table"
            //     options={vapInterfaceOptions}
            //     list={vapInterfacesList}
            //   />
            // </div>
          }
          {
            // wirelessMode === 'ap' || wirelessMode === 'repeater' ? (
            //   <div className="clientListTable">
            //     <h3 className="stats-group-cell">{_('Clients')}</h3>
            //     <div className="stats-group-cell">
            //       <Table
            //         className="table"
            //         options={clientOptions}
            //         list={staList}
            //       />
            //     </div>
            //   </div>
            // ) : null
          }
          {
            wirelessMode === 'sta' ? (
              <div className="remoteApTable">
                <h3 className="stats-group-cell">{_('Connection Info')}</h3>
                <div className="stats-group-cell">
                  <Table
                    className="table"
                    options={connectionInfoOption}
                    list={peerList}
                  />
                </div>
              </div>
            ) : null
          }
        </div>


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
    dispatch
  );
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(SystemStatus);

export const systemstatus = reducer;
