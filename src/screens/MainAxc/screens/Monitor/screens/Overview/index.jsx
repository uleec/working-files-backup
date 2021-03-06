import React from 'react'; import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import utils from 'shared/utils';
import { Map, List, fromJS } from 'immutable';
import { actions as appActions } from 'shared/containers/app';
import { actions, AppScreen } from 'shared/containers/appScreen';
import { colors, $$commonPieOption } from 'shared/config/axc';
import {
  Modal, Table, Select, EchartReact, Button, FormGroup, Icon, Tooltip,
} from 'shared/components';

const msg = {
  days: __('Days'),
  goSetting: __('Go to Setting'),
  helpText: __('To enable Rogue AP and Interfering AP detection, please go to AP Group > WIPS/WIDS , enable the AP Monitor function and to collect information about neighbor APs.'),
};
const timeTypeSwitchs = fromJS([
  {
    value: 'today',
    label: __('Today'),
  },
  {
    value: 'yesterday',
    label: __('Yesterday'),
  },
  {
    value: 'week',
    label: `7 ${msg.days}`,
  },
  {
    value: 'half_month',
    label: `15 ${msg.days}`,
  },
  {
    value: 'month',
    label: `30 ${msg.days}`,
  },
]);
const ssidTableOptions = fromJS([
  {
    id: 'time',
    text: __('Time'),
    width: 140,
  }, {
    id: 'mac',
    text: __('MAC'),
    width: 140,
  }, {
    id: 'ssid',
    text: __('SSID'),
  }, {
    id: 'channel',
    text: __('Channel'),
    width: 140,
  }, {
    id: 'rssi',
    text: __('RSSI'),
    width: 140,
  },
]);
const chartStyle = {
  width: '100%',
  minHeight: '200px',
};
const flowChartStyle = {
  width: '100%',
  minHeight: '300px',
};

function getTerminalTypeOption(serverData) {
  let dataList = serverData.get('terminalType');
  const ret = $$commonPieOption.mergeDeep({
    title: {
      text: __('Online'),
      subtext: `${serverData.get('clientsNumber') || 0}`,
    },
    legend: {
      formatter: (name) => {
        const num = dataList
          .find($$item => $$item.get('name') === name)
          .get('value') || 0;
        if (!name) return null;
        if ((name.split('\n')).length > 1) {
          return `others: ${num}`;
        }
        return `${name}: ${num}`;
      },
      tooltip: {
        show: true,
        formatter: (params) => {
          let str = '';
          if (typeof params.name === 'undefined') return str;
          // console.log('params.name', params.name);
          const arr = params.name.split('\n');
          arr.forEach((item, index) => {
            if (index === arr.length - 1) str += `${item}`;
            else str += `${item}<br />`;
          });
          return str;
        },
        textStyle: {
          fontSize: 10,
        },
      },
    },
    series: [
      {
        name: __('Type'),
      },
    ],
    tooltip: {
      show: true,
      formatter: (params) => {
        if (typeof params.name === 'undefined') return null;
        const arr = params.name.split('\n');
        if (arr.length > 1) return `Type:<br /> others: ${params.value}`;
        return `Type:<br /> ${params.name}: ${params.value}`;
      },
    },
  }).toJS();


  if (List.isList(dataList)) {
    if (dataList.size < 1) {
      dataList = fromJS([{
        name: __('None'),
        value: 0,
      }]);
    } else {
      dataList = dataList.sort(($$a, $$b) => {
        const a = $$a.get('value');
        const b = $$b.get('value');
        let result = 0;

        if (a < b) {
          result = 1;
        } else if (a > b) {
          result = -1;
        }

        return result;
      });
    }
    // 客户端类别如果超过14个，则从第14个开始，个数相加，统称为others
    const size = dataList.size;
    let num = 0;
    let othermap = fromJS({});
    let otherNameStr = '';
    if (size > 14) {
      let i = 13;
      while (i < size) {
        const name = dataList.getIn([i, 'name']);
        const value = dataList.getIn([i, 'value']);
        otherNameStr += `${name}: ${value}\n`;
        num += value;
        i += 1;
      }
      othermap = othermap.set('name', otherNameStr);
      othermap = othermap.set('value', num);
      dataList = dataList.slice(0, 13);
      dataList = dataList.push(othermap);
    }


    ret.legend.data = dataList.map(item => item.get('name')).toJS();
    ret.series[0].data = dataList.toJS();
  }

  return ret;
}
function getApStatusOption(serverData) {
  const onlineNum = serverData.get('online') || 0;
  const offlineNum = serverData.get('offline') || 0;
  const ret = $$commonPieOption.mergeDeep({
    color: [colors[7], colors[2]],
    title: {
      text: __('AP Status'),
      subtext: `${onlineNum} / ${offlineNum}`,
    },
    legend: {
      formatter: (name) => {
        let num = serverData.get('offline') || 0;

        if (name === __('Online')) {
          num = serverData.get('online') || 0;
        }
        return `${name}: ${num}`;
      },
      data: [__('Online'), __('Offline')],
    },
    series: [
      {
        name: __('Status'),
      },
    ],
  }).toJS();

  ret.series[0].data = [
    { value: onlineNum, name: __('Online') },
    { value: offlineNum, name: __('Offline') },
  ];

  return ret;
}
function getFlowUnit(val, step) {
  const curStep = step || 50;
  let ret = {};


  if (val <= 10240) {
    ret = {
      label: 'B',
      val: 1,
    };
  } else if (val <= (curStep * (1024 ** 2))) {
    ret = {
      label: 'KB',
      val: 1024,
    };
  } else if (val <= (curStep * (1024 ** 3))) {
    ret = {
      label: 'MB',
      val: 1024 ** 2,
    };
  } else if (val <= (curStep * (1024 ** 4))) {
    ret = {
      label: 'GB',
      val: 1024 ** 3,
    };
  } else if (val <= (curStep * (1024 ** 5))) {
    ret = {
      label: 'TB',
      val: 1024 ** 4,
    };
  } else {
    ret = {
      label: 'PB',
      val: 1024 ** 5,
    };
  }
  return ret;
}

function getFlowOption(serverData, timeType) {
  let utilObj = {};
  const option = {
    color: [colors[0], colors[1]],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        function convertFlowBackToOrigin(val) {
          const origin = val * utilObj.val;
          const ret = getFlowUnit(origin, 1);
          const label = ret.label;
          const valWithUnit = `${parseFloat(Number(origin / ret.val)).toFixed(2)} ${label}`;
          return valWithUnit;
        }

        let ret = `${params[0].name}<br />`;

        if (params[0] && params[0].seriesName) {
          ret += `${params[0].seriesName}: ${convertFlowBackToOrigin(params[0].value)}<br />`;
        }

        if (params[1] && params[1].seriesName) {
          ret += `${params[1].seriesName}: ${convertFlowBackToOrigin(params[1].value)}`;
        }

        return ret;
      },
    },
    legend: {
      data: ['AP', __('Wireless')],
    },
    grid: {
      left: '0',
      right: '7%',
      bottom: '3%',
      containLabel: true,
    },
    calculable: true,
    xAxis: [{
      type: 'category',
      interval: 1,
      nameGap: 5,
      nameTextStyle: {
        fontWeight: 'bolder',
      },
      splitLine: {
        show: false,
        interval: 0,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        interval: 0,
      },
    }],
    yAxis: [{
      type: 'value',
      name: __('KB'),
      splitNumber: 5,
      min: 0,
      axisLabel: {
        formatter: '{value}',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted',
          color: '#e1e6e9',
        },
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    }],
    series: [
      {
        name: 'AP',
        type: 'line',
        smooth: true,
      },
      {
        name: __('Wireless'),
        type: 'line',
        smooth: true,
      },
    ],
  };
  let xAxisData;
  let xAxisName = __('Days');
  let $$dataList = serverData.getIn(['flowList']);
  let maxVal = 0;
  let maxVal1 = 0;

  if (!$$dataList || !$$dataList.getIn([0, 'data']) || !$$dataList.getIn([1, 'data'])) {
    return null;
  }
  if ($$dataList.getIn([0, 'data'])) {
    maxVal = $$dataList.getIn([0, 'data']).max(
      (a, b) => parseInt(a, 10) > parseInt(b, 10),
    );
  }
  if ($$dataList.getIn([1, 'data'])) {
    maxVal1 = $$dataList.getIn([1, 'data']).max(
      (a, b) => parseInt(a, 10) > parseInt(b, 10),
    );
  }

  if (maxVal1 > maxVal) {
    maxVal = maxVal1;
  }

  utilObj = getFlowUnit(maxVal);

  $$dataList = $$dataList.toJS();

  if (timeType === 'yesterday' ||
    timeType === 'today') {
    xAxisData = List(new Array(24)).map(
      (val, i) => `${i}:00`,
    ).toJS();
    xAxisName = __('Hours');
  } else if (timeType === 'week') {
    xAxisData = List(new Array(7)).map(
      (val, i) => i + 1,
    ).toJS();
  } else if (timeType === 'half_month') {
    xAxisData = List(new Array(15)).map(
      (val, i) => i + 1,
    ).toJS();
  } else {
    xAxisData = List(new Array(30)).map(
      (val, i) => i + 1,
    ).toJS();
  }

  option.xAxis[0].data = xAxisData;
  option.xAxis[0].name = xAxisName;
  option.yAxis[0].name = utilObj.label;

  option.series[0].data = $$dataList[0].data.map(
    val => parseFloat(Number(val / utilObj.val)),
  );
  option.series[1].data = $$dataList[1].data.map(
    val => parseFloat(Number(val / utilObj.val)),
  );

  return option;
}

const propTypes = {
  store: PropTypes.instanceOf(Map),
  fetchScreenData: PropTypes.func,
  changeScreenQuery: PropTypes.func,
  updateCurListItem: PropTypes.func,
  createModal: PropTypes.func,
  onListAction: PropTypes.func,
  changeScreenActionQuery: PropTypes.func,
  fetch: PropTypes.func,
  closeListItemModal: PropTypes.func,
};
const defaultProps = {};
export default class GroupOverview extends React.Component {
  constructor(props) {
    super(props);

    utils.binds(this, [
      'onChangeTimeType',
      'handleCounterAp',
      'handleModelOk',
    ]);

    this.rogueSsidOptions = ssidTableOptions.push(
      fromJS({
        id: '__actions__',
        text: __('Actions'),
        fixed: 'right',
        width: 140,
        render: (val, $$data) => {
          const isCounter = $$data.get('isCounter');
          let btnText = __('Counter This AP');

          if (isCounter === 1) {
            btnText = __('Countering');
          }

          // 如果没有值则放回null, 兼容以前版本
          if (typeof isCounter === 'undefined') {
            return null;
          }

          return (
            <div className="action-btns">
              <Button
                text={btnText}
                disabled={isCounter === 1}
                onClick={
                  () => this.handleCounterAp($$data)
                }
              />
            </div>
          );
        },
      }),
    );

    this.state = {
      counterAps: [],
    };
  }
  componentWillMount() {
    this.initOptions(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const curScreenId = nextProps.store.get('curScreenId');

    if (this.props.store.getIn([curScreenId, 'data']) !== nextProps.store.getIn([curScreenId, 'data'])) {
      this.initOptions(nextProps);
    }
  }
  onChangeTimeType(data) {
    this.props.changeScreenQuery({
      timeType: data.value,
    });
    this.props.fetchScreenData();
  }
  handleCounterAp($$data) {
    const isCounter = $$data.get('isCounter');

    if (isCounter === 0) {
      this.props.updateCurListItem({
        radioId: $$data.get('radioId'),
        ssidmac: $$data.get('mac'),
        ssidname: $$data.get('ssid'),
        channel: $$data.get('channel'),
        wirelessmode: $$data.get('wirelessmode'),
      });
      this.props.changeScreenActionQuery({
        action: 'edit',
        myTitle: __('Counter AP: %s', $$data.get('mac')),
      });
      this.props.fetch('/goform/group/ap/counter', {
        ssidmac: $$data.get('mac'),
        ssidname: $$data.get('ssid'),
      }).then(
        (rqData) => {
          if (rqData && rqData.data && rqData.data.list) {
            this.setState({
              counterAps: rqData.data.list.map(
                item => ({
                  value: item.apMac,
                  label: item.apMac,
                }),
              ),
            });
          }
        },
      );
    }
  }
  handleModelOk() {
    if (this.noApMac) {
      this.props.createModal({
        type: 'alert',
        text: __('Please select a counter ap'),
      });
    } else {
      this.props.createModal({
        type: 'confrim',
        text: __('This ap will fully support the counter function, stop the normal business, you sure to open?'),
        apply: () => {
          this.props.onListAction({
            url: '/goform/group/ap/counter',
          });
        },
      });
    }
  }

  initOptions(props) {
    const { store } = props;
    const curScreenId = store.get('curScreenId');
    const serverData = store.getIn([curScreenId, 'data']);

    this.serverData = serverData;
    this.apStatusOption = getApStatusOption(serverData);
    this.terminalTypeOption = getTerminalTypeOption(serverData);
    this.flowOption = getFlowOption(serverData, store.getIn([curScreenId, 'query', 'timeType']));
  }

  render() {
    const { store } = this.props;
    const { serverData, apStatusOption, terminalTypeOption, flowOption } = this;
    const curScreenId = store.get('curScreenId');
    const $$actionQuery = store.getIn([curScreenId, 'actionQuery']);
    const $$curListItem = store.getIn([curScreenId, 'curListItem']);
    const helpIconStyle = {
      color: '#0093dd',
      marginLeft: '12px',
      cursor: 'pointer',
    };

    if (!$$curListItem.get('apMac')) {
      this.noApMac = true;
    } else {
      this.noApMac = false;
    }
    return (
      <AppScreen
        {...this.props}
        initOption={{
          isFetchInfinite: true,
          fetchIntervalTime: 10000,
          query: {
            timeType: 'today',
          },
        }}
      >
        <div className="t-overview">
          <div className="t-overview__section row">
            <div className="cols col-6" >
              <div className="element">
                <h3>{__('AP')}</h3>
              </div>
              <div className="element">
                <EchartReact
                  option={apStatusOption}
                  className="o-box__canvas"
                  style={chartStyle}
                />
              </div>
            </div>
            <div className="cols col-6">
              <div className="element">
                <h3>{__('Clients')}</h3>
              </div>
              <div className="element row">
                <EchartReact
                  option={terminalTypeOption}
                  className="o-box__canvas cols col-8"
                  style={chartStyle}
                />
              </div>
            </div>
          </div>

          <h3 className="element t-overview__header">{__('Historical Graphs')}</h3>
          <div className="t-overview__section">
            <div className="element t-overview__section-header">
              <h3>
                <span
                  style={{
                    marginRight: '16px',
                  }}
                >
                  {__('Traffic')}
                </span>
                <Select
                  options={timeTypeSwitchs.toJS()}
                  value={store.getIn([curScreenId, 'query', 'timeType'])}
                  onChange={this.onChangeTimeType}
                  clearable={false}
                />
              </h3>
            </div>
            <div className="element">
              <EchartReact
                option={flowOption}
                className="o-box__canvas"
                style={flowChartStyle}
              />
            </div>
          </div>

          <div className="element">
            <h3 className="t-overview__header">
              {__('Rogue AP List')}
              <Tooltip
                title={msg.helpText}
                placement="right"
              >
                <Icon name="question-circle" style={helpIconStyle} />
              </Tooltip>
              <a href="#/main/group/safe/wips" className="link-more">{`${msg.goSetting}>>`}</a>
            </h3>
          </div>
          <div className="element t-overview__section">
            <Table
              theme="light"
              options={this.rogueSsidOptions}
              list={serverData.getIn(['neighborsAps', 'list']) || fromJS([])}
              page={serverData.getIn(['neighborsAps', 'page'])}
              configurable={false}
              scroll={{
                y: 240,
              }}
            />
          </div>
          <div className="element">
            <h3 className="t-overview__header">
              {__('Interfering AP List')}
              <Tooltip
                title={msg.helpText}
                placement="right"
              >
                <Icon name="question-circle" style={helpIconStyle} />
              </Tooltip>
              <a href="#/main/group/safe/wips" className="link-more">{`${msg.goSetting}>>`}</a>
            </h3>
          </div>
          <div className="element t-overview__section">
            <Table
              theme="light"
              options={ssidTableOptions}
              list={serverData.getIn(['aroundAps', 'list']) || fromJS([])}
              page={serverData.getIn(['aroundAps', 'page'])}
              configurable={false}
              scroll={{
                y: 240,
              }}
            />
          </div>

        </div>
        <Modal
          id="AppScreenModal"
          isShow={$$actionQuery.get('action') === 'edit'}
          title={$$actionQuery.get('myTitle')}
          onClose={() => {
            this.props.closeListItemModal();
          }}
          onOk={this.handleModelOk}
        >
          <FormGroup
            id="apMac"
            label={__('Select Counter AP')}
            type="select"
            value={$$curListItem.get('apMac')}
            options={this.state.counterAps}
            onChange={
              (data) => {
                this.props.updateCurListItem({
                  apMac: data.value,
                });
              }
            }
            searchable
          />
        </Modal>
      </AppScreen>
    );
  }
}

GroupOverview.propTypes = propTypes;
GroupOverview.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    groupid: state.product.getIn(['group', 'selected', 'id']),
    store: state.screens,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    actions,
  ), dispatch);
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupOverview);
