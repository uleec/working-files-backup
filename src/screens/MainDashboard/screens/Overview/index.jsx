import React from 'react'; import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import utils from 'shared/utils';
import { Map } from 'immutable';
import { Icon, EchartReact, Table } from 'shared/components';
import { actions as appActions } from 'shared/containers/app';
import { actions, AppScreen } from 'shared/containers/appScreen';
import echarts from 'echarts/lib/echarts';
import h337 from 'heatmap.js';
import { colors, $$commonPieOption } from 'shared/config/axc';

import Rain from './Rain';
import Bar from './Bar';
import MapContainer from './MapContainer';

const REFRESH_INTERVAR = 10000;

function getClientFlowEchartOption($$serverData) {
  const unit = {
    str: '人',
  };
  let data = $$serverData;

  if (!data) return null;

  const date = data.map((val, index) => {
    let ret = index;

    if (ret < 10) {
      ret = `0${ret}`;
    } else {
      ret = `${ret}`;
    }

    return ret;
  }).toJS();

  let dataMax = $$serverData.max((a, b) => (a - b));

  dataMax += (50 - (dataMax % 10));

  data = data.toJS();

  const option = {
    tooltip: {
      trigger: 'axis',
      position(pt, params, dom, rect, size) {
        let diff = 0;
        if (pt[0] > size.viewSize[0] / 2) {
          diff = 160;
        }
        return [pt[0] - diff, '10%'];
      },
      formatter: `{b} <br/> {a}: {c} ${unit.str}`,
    },
    toolbox: {},
    grid: {
      left: 40,
      right: 10,
      top: 30,
      bottom: 20,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: date,
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#ffffff',
        },
      },
    },
    yAxis: {
      type: 'value',
      max: 'dataMax',
      name: `${unit.str}`,
      axisTick: {
        show: false,
      },
      splitNumber: 5,
      splitLine: {
        lineStyle: {
          // 使用深浅的间隔色
          color: ['#323c55'],
          type: 'dashed',
        },
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#ffffff',
        },
      },
    },
    series: [
      {
        name: __('Clients'),
        type: 'line',
        sampling: 'average',
        itemStyle: {
          normal: {
            color: '#eee',
          },
        },
        lineStyle: {
          normal: {
            width: 1,
          },
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgb(19, 61, 101)',
            }, {
              offset: 1,
              color: 'rgb(1, 10, 41)',
            }]),
          },
        },
        data,
      },
    ],
  };

  return option;
}
function getClientTetentionTimeOption($$serverData) {
  const unit = {
    str: '人',
  };
  const data = [];
  const xAxisData = [];
  const backgroundData = [];
  let max = 0;

  if ($$serverData) {
    max = $$serverData.max((a, b) => a - b);
    $$serverData.forEach((val, key) => {
      xAxisData.unshift(`${key}`);
      data.unshift(val);
      backgroundData.unshift(max);
    });
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      position(pt, params, dom, rect, size) {
        let diff = 0;
        if (pt[0] > size.viewSize[0] / 2) {
          diff = 160;
        }
        return [pt[0] - diff, '10%'];
      },
      formatter: `滞留{b}分钟人数 <br/> {c} ${unit.str}`,
    },
    toolbox: {},
    grid: {
      left: 40,
      right: 0,
      top: 30,
      bottom: 20,
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: xAxisData,
      name: __('分钟'),
      axisLine: {
        show: false,
        lineStyle: {
          color: '#ffffff',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      max: 'dataMax',
      name: `${unit.str}`,
      splitNumber: 4,
      axisLine: {
        show: false,
        lineStyle: {
          color: '#ffffff',
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
        lineStyle: {
          // 使用深浅的间隔色
          color: ['#323c55'],
        },
      },
    },
    series: [
      {
        name: __('Client'),
        type: 'bar',
        barWidth: 16,
        silent: false,
        z: 2,
        itemStyle: {
          normal: {
            color: '#2ea9e5',
          },
        },
        data,
      },
      {
        name: __('Max'),
        type: 'bar',
        silent: true,
        barWidth: 16,
        z: 1,
        barGap: '-100%',
        itemStyle: {
          normal: {
            color: '#eee',
          },
        },
        data: backgroundData,
      },

    ],
  };

  return option;
}
function getClientsTimeOption($$serverData, total) {
  const myData = [];
  const ret = $$commonPieOption.mergeDeep({
    color: [colors[1], colors[7]],
    title: {
      text: `${__('总记')}`,
      subtext: `${total || ''} 人`,
      x: '48.2%',
      y: '37%',
      textStyle: {
        fontSize: '14',
        color: '#fff',
      },
      subtextStyle: {
        fontSize: '18',
        fontWeight: 'bolder',
        color: '#fff',
      },
    },
    series: [
      {
        name: __('滞留时间人数'),
        type: 'pie',
        center: ['50%', '50%'],
      },
    ],
  }).toJS();

  if ($$serverData) {
    $$serverData.forEach((val, key) => {
      myData.unshift({
        value: val,
        name: `${key}分钟`,
      });
    });
  }

  ret.series[0].data = myData;

  return ret;
}

/**
 * canvas静态点
 *
 * @param {any} ctx        canvas 2d对象
 * @param {any} pathList   静态点列表
 */
function stationaryPoint(ctx, option) {
  const pointsList = option.points;
  const width = option.width;
  const height = option.height;

  // pathList为数组
  if (pointsList && pointsList.length > 0) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;

    pointsList.forEach((point) => {
      ctx.beginPath();
      ctx.arc(
        (parseInt(point.x, 10) * width) / 100,
        (parseInt(point.y, 10) * height) / 100,
        0.5,
        0,
        2 * Math.PI,
      );
      ctx.stroke();
    });
  }
}

const propTypes = {
  store: PropTypes.instanceOf(Map).isRequired,
  fetch: PropTypes.func,
};
const defaultProps = {};

export default class DashboardOverview extends React.PureComponent {
  constructor(props) {
    super(props);

    utils.binds(this, [
      'renderHeatMap',
      'fetchHeatMapData',
      'renderClientsPathsMap',
    ]);
    this.state = {
      heatmapData: [],
      clientsPaths: [],
    };
  }

  componentDidMount() {
    this.fetchHeatMapData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.needUpdateHeatMap !== this.state.needUpdateHeatMap) {
      this.renderHeatMap(this.state.heatmapData);
    }
    if (prevState.needUpdateClientsPathsMap !== this.state.needUpdateClientsPathsMap) {
      this.renderClientsPathsMap(this.clientsPathsCanvas);
    }
  }
  componentWillUnmount() {
    clearTimeout(this.fetchHeatMapTimeout);
    clearTimeout(this.fetchClientsPathsTimeout);
  }

  fetchHeatMapData() {
    clearTimeout(this.fetchHeatMapTimeout);

    this.props.fetch('goform/dashboard/heatmap')
      .then((json) => {
        if (json && json.data && json.data.heatMap) {
          this.setState({
            heatmapData: json.data.heatMap,
            needUpdateHeatMap: Date.now(),
          });
        }
        this.fetchHeatMapTimeout = setTimeout(() => {
          this.fetchHeatMapData();
        }, REFRESH_INTERVAR);
      });
  }

  fetchClientsPathsMapData() {
    clearTimeout(this.fetchClientsPathsTimeout);

    this.props.fetch('goform/dashboard/clientsPaths')
      .then((json) => {
        if (json && json.data && json.data.paths) {
          this.setState({
            clientsPaths: json.data.paths,
            needUpdateClientsPathsMap: Date.now(),
          });
        }
        this.fetchClientsPathsTimeout = setTimeout(() => {
          this.fetchClientsPathsMapData();
        }, REFRESH_INTERVAR);
      });
  }

  renderHeatMap() {
    const newData = [];

    if (this.heatMapContent && this.heatMapContent.offsetWidth > 0) {
      // this.removeHeatMap();
      this.heatMapContentWidth = this.heatMapContent.offsetWidth;
      this.heatMapContentHeight = this.heatMapContent.offsetHeight;

      if (!this.heatmapInstance) {
        this.heatmapInstance = h337.create({
          container: this.heatMapContent,
          radius: 24,
        });
      } else {
        this.state.heatmapData.forEach((item) => {
          newData.push({
            x: (item.x * this.heatmapInstance._renderer._width) / 100,
            y: (item.y * this.heatmapInstance._renderer._height) / 100,
            value: item.value,
          });
        });
      }

      this.heatmapInstance.setData({
        data: newData,
      });
      this.setState({
        heatMapDataUrl: this.heatmapInstance.getDataURL(),
      });
    }
  }

  renderClientsPathsMap(elem) {
    const { clientsPaths } = this.state;
    let loopStep = null;

    if (elem && elem.offsetWidth > 0 && clientsPaths.length > 0) {
      const ctx = elem.getContext('2d');
      const width = elem.offsetWidth;
      const height = elem.offsetHeight;
      const len = clientsPaths.length;

      ctx.clearRect(0, 0, width, height);

      // 画线前先清除 以前划线定时器
      cancelAnimationFrame(this.drawAnimationFrame);

      loopStep = (startIndex = 0) => {
        let curIndex = startIndex;

        stationaryPoint(ctx, {
          width,
          height,
          points: clientsPaths[curIndex].clients,
        });

        curIndex += 1;
        if (curIndex < len) {
          this.dClientPathsAnimationFrame = requestAnimationFrame(() => {
            loopStep(curIndex);
          });
        }
      };

      loopStep(0);
    }
  }

  render() {
    const { store } = this.props;
    const { heatMapDataUrl, clientsMapwidth, clientsMapHeight  } = this.state;
    const curScreenId = store.get('curScreenId');
    const $$serverData = store.getIn([curScreenId, 'data']);
    const warningLevel = Math.ceil($$serverData.getIn(['environment', 'rainfall']) / 45);

    return (
      <AppScreen
        {...this.props}
        refreshInterval={REFRESH_INTERVAR}
        noLoading
      >
        <div className="rw-dashboard row">
          <div className="cols col-2">
            <div className="rw-dashboard-card">
              <h3 className="element rw-dashboard-location__header">
                {$$serverData.get('build')}
                {$$serverData.get('floor') || ' '}
                &nbsp;
                <Icon name="chevron-circle-down" style={{ marginTop: '4px' }} className="fr" />
              </h3>
            </div>
            <div className="rw-dashboard-card rw-dashboard-card--lg">
              <h3 className="element">环境监测</h3>
              <div className="element rw-dashboard-environment">
                <ul className="rw-description-list">
                  <li className="fl col-5">
                    <Icon name="thermometer-half" size="5x" />
                  </li>
                  <li className="fl col-7">
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>
                      {$$serverData.getIn(['environment', 'temperature'])} °
                      <Icon name="cloud" style={{ marginLeft: '12px' }} />
                    </div>
                    <div style={{ fontSize: '20px', marginTop: '12px', lineHeight: '1' }}>深圳</div>
                  </li>
                </ul>
              </div>
              <div className="row element rw-dashboard-environment">
                <div className="fl col-3">
                  <dl>
                    <dt>湿度</dt>
                    <dt><Icon name="tint" size="2x" /></dt>
                    <dd>{$$serverData.getIn(['environment', 'humidity']) || 0}</dd>
                  </dl>
                </div>
                <div className="fl col-3">
                  <dl>
                    <dt>PM2.5</dt>
                    <dt><Icon name="leaf" size="2x" /></dt>
                    <dd>{$$serverData.getIn(['environment', 'ph']) || 0}</dd>
                  </dl>
                </div>
                <div className="fl col-3">
                  <dl>
                    <dt>噪声</dt>
                    <dt><Icon name="bullhorn" size="2x" /></dt>
                    <dd>{$$serverData.getIn(['environment', 'noise']) || 0}</dd>
                  </dl>
                </div>
                <div className="fl col-3">
                  <dl>
                    <dt>水质</dt>
                    <dt><Icon name="flask" size="2x" /></dt>
                    <dd>{$$serverData.getIn(['environment', 'water']) || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="rw-dashboard-card rw-dashboard-card--lg">
              <h3 className="element">滞留时间分布</h3>
              <div className="element row">
                <EchartReact
                  className="chart-container"
                  option={
                    getClientsTimeOption(
                      $$serverData.getIn(['clients', 'retentionTime']),
                      $$serverData.getIn(['clients', 'total']),
                    )
                  }
                />
              </div>
            </div>
            <div className="rw-dashboard-card rw-dashboard-card--lg">
              <h3 className="element">洪涝预警</h3>
              <div className="element row">
                <div className="cols col-5" >
                  <Rain warningLevel="4" text="暴雨" active={warningLevel === 4} />
                  <Rain warningLevel="3" text="暴雨" active={warningLevel === 3} />
                  <Rain warningLevel="2" text="暴雨" active={warningLevel === 2} />
                  <Rain warningLevel="1" text="暴雨" active={warningLevel === 1} />
                </div>
                <div className="fl col-7">
                  <Bar
                    min="0"
                    max="210"
                    value={$$serverData.getIn(['environment', 'rainfall'])}
                    scale={6}
                    style={{
                      height: '182px',
                    }}
                  />
                </div>
                <div className="cols col-12 ">
                  <div className="rain-description">
                    降水量：<span>{$$serverData.getIn(['environment', 'rainfall'])}</span> mm
                  </div>
                </div>
              </div>
            </div>
            <div className="rw-dashboard-card rw-dashboard-card--lg">
              <h3 className="element">车位信息</h3>
              <div className="element">
                <dl className="rw-description-list">
                  <dt><Icon name="square" style={{ color: '#007bff' }} />闲置车位</dt>
                  <dd>{$$serverData.getIn(['parking', 'total']) - $$serverData.getIn(['parking', 'used'])}</dd>
                </dl>
                <dl className="rw-description-list">
                  <dt><Icon name="square" style={{ color: '#ffc107' }} />预定车位</dt>
                  <dd>{$$serverData.getIn(['parking', 'booked'])}</dd>
                </dl>
                <dl className="rw-description-list">
                  <dt>
                    <Icon name="square" style={{ color: '#fd7e14' }} />已停车位
                  </dt>
                  <dd>{$$serverData.getIn(['parking', 'used'])}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="cols col-5">
            <div className="rw-dashboard-card">
              <h3 className="element">本日客流量</h3>
              <div className="element">
                <EchartReact
                  className="chart-container"
                  style={{
                    height: '225px',
                  }}
                  option={getClientFlowEchartOption($$serverData.getIn(['clients', 'today']))}
                />
              </div>
            </div>
            <div className="rw-dashboard-card">
              <h3 className="element">平均滞留时间</h3>
              <div className="element">
                <EchartReact
                  className="chart-container"
                  option={getClientTetentionTimeOption($$serverData.getIn(['clients', 'retentionTime']))}
                />
              </div>
            </div>
            <div className="rw-dashboard-card">
              <h3 className="element">关键区域客流分析</h3>
              <div className="element" style={{ height: '270px' }}>
                <Table
                  options={[
                    {
                      id: 'location',
                      text: '位置',
                    }, {
                      id: 'live',
                      text: ' 实时游客',
                    }, {
                      id: 'total',
                      text: '今日总游客',
                    }, {
                      id: 'new',
                      text: '今日新游客',
                    }, {
                      id: 'newRate',
                      text: '今日新游客占比',
                    }, {
                      id: 'retentionTime',
                      text: '平均逗留时间',
                    },
                  ]}
                  scroll={{
                    y: '180px',
                  }}
                  list={$$serverData.getIn(['clientsAnalysis'])}
                  paginationType="none"
                />
              </div>
            </div>
          </div>
          <div className="cols col-5">
            <div
              className={
                this.state.heatmapMax ? 'rw-dashboard-card rw-dashboard-card--max rw-dashboard-card--fixed-header' : 'rw-dashboard-card rw-dashboard-card--fixed-header'
              }
            >
              <h3 className="element rw-dashboard-card__header" >
                热力图
                {
                  this.state.heatmapMax ? (
                    <Icon
                      name="compress"
                      className="fr"
                      onClick={() => {
                        this.setState({
                          heatmapMax: false,
                        });
                      }}
                    />
                  ) : (
                    <Icon
                      name="expand"
                      className="fr"
                      onClick={() => {
                        this.setState({
                          heatmapMax: true,
                        });
                      }}
                    />
                  )
                }

              </h3>
              <MapContainer
                onReady={(data) => {
                  this.heatMapContent = data.contentElem;
                  this.heatMapZoom = data.zoom;

                  this.setState({
                    needUpdateHeatMap: Date.now(),
                  });
                }}
                style={{
                  height: '525px',
                }}
                className="rw-dashboard-card__content"
              >
                {
                  heatMapDataUrl ? (
                    <img src={heatMapDataUrl} draggable="false" className="overlay-img" alt="heatMap" />
                  ) : null
                }
              </MapContainer>
            </div>
            <div className="rw-dashboard-card rw-dashboard-card--fixed-header">
              <h3 className="element rw-dashboard-card__header">
                客流轨迹图
                <Icon name="expand" className="fr" />
              </h3>
              <MapContainer
                onReady={(data) => {
                  this.clientsPathsMapContent = data.contentElem;
                  this.clientPathsMapZoom = data.zoom;
                  this.fetchClientsPathsMapData();
                  this.setState({
                    clientsMapwidth: data.width,
                    clientsMapHeight: data.height,
                  });
                }}
                onZoomChange={(data) => {
                  this.clientPathsMapZoom = data.zoom;
                  this.setState({
                    clientsMapwidth: data.width,
                    clientsMapHeight: data.height,
                    needUpdateClientsPathsMap: Date.now(),
                  });
                }}
                className="rw-dashboard-card__content"
              >
                <canvas
                  className="rw-map-canvas"
                  ref={(elem) => { this.clientsPathsCanvas = elem; }}
                  style={{
                    width: `${clientsMapwidth}px`,
                    height: `${clientsMapHeight}px`,
                  }}
                />
              </MapContainer>
            </div>
          </div>
        </div>
      </AppScreen>
    );
  }
}

DashboardOverview.propTypes = propTypes;
DashboardOverview.defaultProps = defaultProps;

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
)(DashboardOverview);
