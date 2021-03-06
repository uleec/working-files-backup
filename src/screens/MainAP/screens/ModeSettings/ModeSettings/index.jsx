import React from 'react'; import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { Map } from 'immutable';
import FormGroup from 'shared/components/Form/FormGroup';
import SaveButton from 'shared/components/Button/SaveButton';
import ProgressBar from 'shared/components/ProgressBar';
import validator from 'shared/validator';
import Modal from 'shared/components/Modal';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { actions as appActions } from 'shared/containers/app';
import { actions as sharedActions } from 'shared/containers/settings';

const propTypes = {
  fetch: PropTypes.func,
  save: PropTypes.func,
  updateItemSettings: PropTypes.func,
  initSettings: PropTypes.func,
  route: PropTypes.object,
  createModal: PropTypes.func,
  validateAll: PropTypes.func,
  validateOption: PropTypes.object,
  store: PropTypes.instanceOf(Map),
};

const validOptions = Map({
  validateIp: validator({
    rules: 'ip',
  }),
});

export default class ModeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.saveModalChange = this.saveModalChange.bind(this);
  }

  componentWillMount() {
    this.props.initSettings({
      settingId: this.props.route.id,
      defaultData: {
        showProgressBar: false,
        enable: '0',
        discoveryType: 'dhcp',
        acIp: '',
      },
    });
    this.props.fetch('goform/get_firstLogin_info')
        .then((json) => {
          if (json.state && json.state.code === 2000) {
            this.props.updateItemSettings({
              nextMode: json.data.enable,
              currMode: json.data.enable,
              currDiscoveryType: json.data.discoveryType,
              discoveryType: json.data.discoveryType,
              currAcIp: json.data.acIp,
              acIp: json.data.acIp,
              enable: json.data.enable,
            });
          }
        });
  }

  // onSave() {
  //   this.props.validateAll().then((msg) => {
  //     let str = true;
  //     if (msg.isEmpty()) { // 因IP地址最后一个数字修改为不允许设为255，该部分代码失效
  //       const acIp = this.props.store.getIn(['curData', 'acIp']);
  //       const mask = '255.255.255.0';
  //       str = validator.combine.noBroadcastIp(acIp, mask);
  //       console.log('str', str);
  //       if (str) {
  //         this.props.createModal({
  //           role: 'alert',
  //           text: str,
  //         });
  //       }
  //     }
  //     return str;
  //   }).then((str) => {
  //     console.log('str', str);
  //     if (!str) {
  //       const {
  //         nextMode, currMode, currDiscoveryType, discoveryType, currAcIp, acIp,
  //       } = this.props.store.get('curData').toJS();
  //       if (nextMode !== currMode) {
  //         this.props.createModal({
  //           role: 'alert',
  //           text: __('Mode changed, REBOOT to take effect ?'),
  //           apply: this.saveModalChange,
  //         });
  //       } else if (nextMode === currMode && nextMode === '1' &&
  //         (currDiscoveryType !== discoveryType || currAcIp !== acIp)) {
  //         this.props.createModal({
  //           role: 'alert',
  //           text: __('Mode configuration changed, REBOOT to take effect ?'),
  //           apply: this.saveModalChange,
  //         });
  //       } else {
  //         this.props.createModal({
  //           role: 'alert',
  //           text: __('Nothing changed, no need to do anything!'),
  //         });
  //       }
  //     }
  //   });
  // }

  onSave() {
    this.props.validateAll().then((msg) => {
      if (msg.isEmpty()) {
        const {
          nextMode, currMode, currDiscoveryType, discoveryType, currAcIp, acIp,
        } = this.props.store.get('curData').toJS();
        if (nextMode !== currMode) {
          this.props.createModal({
            role: 'alert',
            text: __('Mode changed, REBOOT to take effect ?'),
            apply: this.saveModalChange,
          });
        } else if (nextMode === currMode && nextMode === '1' &&
          (currDiscoveryType !== discoveryType || currAcIp !== acIp)) {
          this.props.createModal({
            role: 'alert',
            text: __('Mode configuration changed, REBOOT to take effect ?'),
            apply: this.saveModalChange,
          });
        } else {
          this.props.createModal({
            role: 'alert',
            text: __('Nothing changed, no need to do anything!'),
          });
        }
      }
    });
  }

  saveModalChange() {
    const saveDate = {
      enable: this.props.store.getIn(['curData', 'nextMode']),
      discoveryType: this.props.store.getIn(['curData', 'discoveryType']),
      acIp: this.props.store.getIn(['curData', 'acIp']),
    };
    this.props.save('goform/set_thin', saveDate).then((json) => {
      if (json.state && json.state.code === 2000) {
        this.props.updateItemSettings({ showProgressBar: true });
      } else {
        this.props.createModal({
          role: 'alert',
          text: __('Mode Changed Failed !'),
        });
      }
    });
  }

  render() {
    const { nextMode, discoveryType, acIp } = this.props.store.get('curData').toJS();
    return (
      <div className="o-form">
        <div className="o-form__legend">{__('Device Operation Mode')}</div>
        <br />
        <FormGroup
          type="select"
          label={__('AP Mode')}
          value={nextMode}
          options={[
            { value: '0', label: __('Fat AP Mode') },
            { value: '1', label: __('Thin AP Mode') },
          ]}
          onChange={(data) => {
            this.props.updateItemSettings({ nextMode: data.value });
          }}
        />
        {
          nextMode === '1' ? (
            <FormGroup
              type="select"
              label={__('Discovery Type')}
              value={discoveryType}
              options={[
                { value: 'dhcp', label: __('DHCP') },
                { value: 'static', label: __('Static') },
              ]}
              onChange={(data) => {
                this.props.updateItemSettings({ discoveryType: data.value });
              }}
            />
          ) : null
        }
        {
          discoveryType === 'static' && nextMode === '1' ? (
            <FormGroup
              type="text"
              label={__('AC IP')}
              value={acIp}
              onChange={(data) => {
                this.props.updateItemSettings({ acIp: data.value });
              }}
              required
              {...this.props.validateOption.validateIp}
            />
          ) : null
        }
        <FormGroup>
          <SaveButton
            onClick={() => this.onSave()}
          />
        </FormGroup>
        <Modal
          className="excUpgradeBar"
          isShow={this.props.store.getIn(['curData', 'showProgressBar'])}
          style={{
            top: '200px',
            borderRadius: '20px',
          }}
          noFooter
          draggable
        >
          <ProgressBar
            title={__('rebooting , please wait...')}
            time={60}
            callback={() => {
              this.props.updateItemSettings({ showProgressBar: false });
              window.location.href = '#/login';
            }}
            start
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          />
        </Modal>
      </div>
    );
  }
}

ModeSettings.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    store: state.settings,
    app: state.app,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions, sharedActions,
  ), dispatch);
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions),
)(ModeSettings);
