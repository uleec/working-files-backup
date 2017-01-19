import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import utils from 'shared/utils';
import { Map, fromJS } from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import EchartReact from 'shared/components/EchartReact';
import Progress from 'shared/components/Progress';
import AppScreen from 'shared/components/Template/AppScreen';
import * as appActions from 'shared/actions/app';
import * as actions from 'shared/actions/screens';
import { colors, $$commonPieOption } from 'shared/config/axc';

const uptimeFilter = utils.filter('connectTime');

function getCpuOption(serverData) {
  const usedValue = serverData.get('cpuUsed');
  const freeValue = serverData.get('cpuTotal') - usedValue;
  const usedName = `${_('Used')}: ${usedValue}%`;
  const freeName = `${_('Free')}: ${freeValue}%`;
  const ret = $$commonPieOption.mergeDeep({
    color: [colors[1], colors[7]],
    legend: {
      data: [usedName, freeName],
    },
    title: {
      text: `${_('Used')}`,
      subtext: `${usedValue}%`,
    },
    series: [
      {
        name: _('CPU Usage'),
      },
    ],
  }).toJS();

  ret.series[0].data = [
    { value: usedValue, name: usedName },
    { value: freeValue, name: freeName },
  ];

  return ret;
}
function getMemoryOption(serverData) {
  const usedValue = serverData.get('cpuUsed');
  const freeValue = serverData.get('cpuTotal') - usedValue;
  const usedName = `${_('Used')}: ${usedValue}%`;
  const freeName = `${_('Free')}: ${freeValue}%`;
  const ret = $$commonPieOption.mergeDeep({
    color: [colors[1], colors[7]],
    title: {
      text: `${_('Used')}`,
      subtext: `${usedValue}%`,
    },
    legend: {
      data: [usedName, freeName],
    },
    series: [
      {
        name: _('Memory Usage'),
        type: 'pie',
      },
    ],
  }).toJS();

  ret.series[0].data = [
    { value: usedValue, name: usedName },
    { value: freeValue, name: freeName },
  ];

  return ret;
}

function getStoreOption(serverData) {
  const option = {
    color: [colors[1], colors[7]],
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'line',        // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    legend: {
      data: [_('Used'), _('Free')],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '0',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: serverData.get('storeTotal'),
      position: 'bottom',
    },

    yAxis: [
      {
        type: 'category',
        data: [_('Store')],
      },
    ],
    series: [
      {
        name: _('Used'),
        type: 'bar',
        barWidth: 20,
        stack: _('Store'),
        data: [serverData.get('storeUsed')],
      },
      {
        name: _('Free'),
        type: 'bar',
        stack: _('Store'),
        data: [serverData.get('storeTotal') - serverData.get('storeUsed')],
      },
    ],
  };

  return option;
}
/*
                <dl className="o-description-list-row">
                  <dt>{_('CPU ID')}</dt>
                  <dd>{serverData.get('system_cpuid')}</dd>
                </dl>
                <dl className="o-description-list-row">
                  <dt>{_('Flash ID')}</dt>
                  <dd>{serverData.get('system_sdaid')}</dd>
                </dl>
                <dl className="o-description-list-row">
                  <dt>{_('Memory ID')}</dt>
                  <dd>{serverData.get('system_memid')}</dd>
                </dl>
              */
const propTypes = {
  store: PropTypes.instanceOf(Map),
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { store } = this.props;
    const curScreenId = store.get('curScreenId');
    const serverData = store.getIn([curScreenId, 'data']);
    const memoryStatusOption = getMemoryOption(serverData);
    const cpuStatusOption = getCpuOption(serverData);
    const storeStatusOption = getStoreOption(serverData);

    return (
      <AppScreen
        {...this.props}
        refreshInterval="6000"
      >
        <div className="t-overview row">
          <div className="t-overview__section">
            <div className="cols col-4" >
              <div className="element">
                <h3>{ _('Details') }</h3>
              </div>
              <div
                className="element"
                style={{
                  minHeight: '177px',
                }}
              >
                <div className="o-description-list o-description-list--lg">
                  <dl className="o-description-list-row">
                    <dt>{_('Frimware Version')}</dt>
                    <dd>{serverData.get('version') || ''}</dd>
                  </dl>
                  <dl className="o-description-list-row">
                    <dt>{_('System Time')}</dt>
                    <dd>{serverData.get('system_time')}</dd>
                  </dl>
                  <dl className="o-description-list-row">
                    <dt>{_('Uptime')}</dt>
                    <dd>{uptimeFilter.transform(serverData.get('running_time') || 0)}</dd>
                  </dl>
                  <dl className="o-description-list-row">
                    <dt>{_('Storage')}</dt>
                    <dd>
                      <Progress
                        value={serverData.get('storeUsed')}
                        max="100"
                        theme="success"
                        showText
                      />
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="cols col-4" >
              <div className="element">
                <h3>{ _('Memory') }</h3>
              </div>
              <div className="element">
                <EchartReact
                  option={memoryStatusOption}
                  className="o-box__canvas"
                  style={{
                    width: '100%',
                    minHeight: '170px',
                  }}
                />
              </div>
            </div>
            <div className="cols col-4" >
              <div className="element">
                <h3>{ _('CPU') }</h3>
              </div>
              <div className="element">
                <EchartReact
                  option={cpuStatusOption}
                  className="o-box__canvas"
                  style={{
                    width: '100%',
                    minHeight: '170px',
                  }}
                />
              </div>
            </div>
          </div>
          <h3 className="element t-overview__header">{ _('Storage') }</h3>
          <div className="t-overview__section">
            <div className="element">
              <EchartReact
                option={storeStatusOption}
                className="o-box__canvas"
                style={{
                  width: '100%',
                  minHeight: '130px',
                }}
              />
            </div>
          </div>
        </div>
      </AppScreen>
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
    actions,
  ), dispatch);
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(View);
