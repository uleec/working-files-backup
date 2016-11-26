import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Table from 'shared/components/Table';
import Button from 'shared/components/Button/Button';
import Icon from 'shared/components/Icon';
import FormGroup from 'shared/components/Form/FormGroup';
import FormInput from 'shared/components/Form/FormInput';
import { fromJS, Map, List } from 'immutable';
import utils from 'shared/utils';
import * as sharedActions from 'shared/actions/settings';
import * as appActions from 'shared/actions/app';
import * as selfActions from './actions';
import reducer from './reducer';

const flowRateFilter = utils.filter('flowRate');

const propTypes = {
  selfState: PropTypes.instanceOf(Map),
  fetch: PropTypes.func,
  store: PropTypes.instanceOf(Map),
  initSettings: PropTypes.func,
  fetchSettings: PropTypes.func,
  route: PropTypes.object,
  product: PropTypes.instanceOf(Map),
  changeCurrRadioConfig: PropTypes.func,
  updateItemSettings: PropTypes.func,
};

const defaultProps = {
};

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


export default class ClientsDetails extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeRadio = this.onChangeRadio.bind(this);
    // this.addBlockStatus = this.addBlockStatus.bind(this);
    this.updateBlockStatus = this.updateBlockStatus.bind(this);
  }

  componentWillMount() {
    this.props.initSettings({
      settingId: this.props.route.id,
      fetchUrl: this.props.route.fetchUrl,
      defaultData: {},
    });
    this.props.fetchSettings().then(() => {
      this.onChangeRadio({ value: 0 });
    }).then(() => {
      const radioNum = this.props.product.get('deviceRadioList').size;
      for (let i = 0; i < radioNum; i++) {
        const staList = this.props.store.getIn(['curData', 'radioList', i, 'staList'])
                          .map(item => item.set('block', false));
        const radioList = this.props.store.getIn(['curData', 'radioList']).setIn([i, 'staList'], staList);
        this.props.updateItemSettings({ radioList });
        // console.log('radioList', radioList.toJS());
      }
    });
  }

  onChangeRadio(data) { // 注意参数实际是data的value属性，这里表示radio序号
    const radioType = this.props.product.getIn(['deviceRadioList', data.value, 'radioType']);
    const config = fromJS({
      radioId: data.value,
      radioType,
    });
    this.props.changeCurrRadioConfig(config);
  }

  updateBlockStatus(item) {
    const radioId = this.props.selfState.getIn(['currRadioConfig', 'radioId']);
    const staList = this.props.store.getIn(['curData', 'radioList', radioId, 'staList']);
    const index = staList.indexOf(item);
    console.log('index', index);
    const radioList = this.props.store.getIn(['curData', 'radioList'])
                          .setIn([radioId, 'staList', index, 'block'], true);
    this.props.updateItemSettings({ radioList });
  }

  // addBlockStatus(radioId) {
  //   const staList = this.props.store.getIn(['curData', 'radioList', radioId, 'staList'])
  //                       .map(item => item.set('block', false));
  //   const radioList = this.props.store.getIn(['curData', 'radioList']).setIn([radioId, 'staList'], staList);
  //   this.props.updateItemSettings({ radioList });
  // }

  render() {
    const that = this;
    const clientOptions = fromJS([
      {
        id: 'mac',
        text: 'Mac',
      },
      {
        id: 'deviceName',
        text: _('Device Name'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'ssid',
        text: _('Owner SSID'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'signal',
        text: _('Signal(dBm)'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'noise',
        text: _('Noise(dBm)'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'txRate',
        text: _('Tx Rate'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return `${val}Mbps`;
        },
      },
      {
        id: 'rxRate',
        text: _('Rx Rate'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return `${val}Mbps`;
        },
      },
      {
        id: 'txBytes',
        text: _('Tx Bytes'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return flowRateFilter.transform(val);
        },
      },
      {
        id: 'rxBytes',
        text: _('Rx Bytes'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return flowRateFilter.transform(val);
        },
      },
      {
        id: 'txPackets',
        text: _('Tx Packets'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'rxPackets',
        text: _('Rx Packets'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'connectTime',
        text: _('Connect Time'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return changeUptimeToReadable(val);
        },
      },
      {
        id: 'ipAddr',
        text: _('IP'),
        transform(val) {
          if (val === '' || val === undefined) {
            return '--';
          }
          return val;
        },
      },
      {
        id: 'block',
        text: _('Block'),
        transform(val, item) {
          return (
            val ? (
              <span>{_('offline')}</span>
            ) : (
              <Icon
                name="user-times"
                size="lg"
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const query = {
                    vapId: item.get('vapId'),
                    radioId: that.props.selfState.getIn(['currRadioConfig', 'radioId']),
                    mac: item.get('mac'),
                  };
                  that.props.fetch('goform/kick_user_offline', query).then((json) => {
                    if (json.state && json.state.code === 2000) {
                      that.updateBlockStatus(item);
                    }
                  });
                }}
              />
            )
          );
        },
      },
    ]);
    const { radioId, radioType } = this.props.selfState.get('currRadioConfig').toJS();
    if (!this.props.store.getIn(['curData', 'radioList', radioId, 'staList'])) return null;
    // const { wirelessMode, vapList } = this.props.store.getIn(['curData', 'radioList', radioId]).toJS();
    const staList = this.props.store.getIn(['curData', 'radioList', radioId, 'staList']).toJS();
    return (
      <div className="o-box">
        <Button
          text={_('Back')}
          theme="primary"
          style={{
            marginBottom: '15px',
          }}
          onClick={() => {
            window.location.href = '#/main/status/overview';
          }}
        />

        <div className="o-box__cell clearfix">
          <h3
            className="fl"
            style={{
              paddingTop: '3px',
              marginRight: '15px',
            }}
          >
            {_('Clients')}
          </h3>
          {
            this.props.product.get('deviceRadioList').size > 1 ? (
              <FormInput
                type="switch"
                label={_('Radio Select')}
                minWidth="100px"
                options={this.props.product.get('radioSelectOptions')}
                value={this.props.selfState.getIn(['currRadioConfig', 'radioId'])}
                onChange={(data) => {
                  this.onChangeRadio(data);
                  // Promise.resolve().then(() => {
                  //   this.onChangeRadio(data);
                  // }).then(() => {
                  //   const id = this.props.selfState.getIn('currRadioConfig', 'radioId');
                  //   this.addBlockStatus(id);
                  // });
                }}
              />
            ) : null
          }
        </div>
        <div className="o-box__cell">
          <Table
            className="table"
            options={clientOptions}
            list={staList}
          />
        </div>
      </div>
    );
  }
}

ClientsDetails.propTypes = propTypes;
ClientsDetails.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    selfState: state.ssiddetails,
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
)(ClientsDetails);

export const clientsdetails = reducer;
