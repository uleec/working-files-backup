import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fromJS, Map } from 'immutable';
import { FormGroup, FormInput, Modal } from 'shared/components';
import { Button } from 'shared/components/Button';
import * as appActions from 'shared/actions/app';
import * as settingActions from 'shared/actions/settings';
import utils from 'shared/utils';
import ProgressBar from './ProgressBar';
import * as selfActions from './actions';
import reducer from './reducer';
// import './index.scss';

const propTypes = {
  save: PropTypes.func,
  route: PropTypes.object,
  changeProgressBarInfo: PropTypes.func,
  changeShowProgessBar: PropTypes.func,
  selfState: PropTypes.instanceOf(Map),
  showProgessBar: PropTypes.bool,
  isShow: PropTypes.bool,
  initSettings: PropTypes.func,
  fetchSettings: PropTypes.func,

  createModal: PropTypes.func,
  restoreSelfState: PropTypes.func,
  changeUpgradeBarInfo: PropTypes.func,
  resetSelfState: PropTypes.func,
};

export default class SystemMaintenance extends Component {
  constructor(props) {
    super(props);

    this.onFarewellUpgrade = this.onFarewellUpgrade.bind(this);
    this.onConfigurationRestore = this.onConfigurationRestore.bind(this);
    this.onRebootDevice = this.onRebootDevice.bind(this);
    this.onResetDevice = this.onResetDevice.bind(this);
    this.onBackupConfig = this.onBackupConfig.bind(this);
  }

  componentWillMount() {
    const props = this.props;
    this.props.initSettings({
      settingId: props.route.id,
      fetchUrl: props.route.fetchUrl,
    });
  }

  // componentDidUpdate() {
  //   this.props.restoreSelfState();
  // }

  componentWillUnmount() {
    this.props.changeProgressBarInfo(fromJS({
      title: '',
      time: 0,
      isShow: false,
    }));
  }

  onFarewellUpgrade(e) {
    const that = this;
    const input = document.getElementById('upgradeFile');
    const formElem = document.getElementById('upgradeForm');
    let data;

    e.preventDefault();

    if (!input.value) {
      return;
    }
    const extension = utils.getExtension(input.value);

    function upgradeDevice() {
      if (typeof FormData === 'function') {
        data = new FormData();
        data.append('filename', input.files[0]);
        data.append('suffix', extension);
        const step = Promise.resolve();
        step.then(() => {
          const upgradeBarInfo = that.props.selfState.get('upgradeBarInfo')
                                    .set('isShow', true);
          that.props.changeUpgradeBarInfo(upgradeBarInfo);
        }).then(() => {
          const upgradeBarInfo = that.props.selfState.get('upgradeBarInfo')
                                    .setIn(['firstBar', 'start'], true);
          that.props.changeUpgradeBarInfo(upgradeBarInfo);
        });

        that.props.fetch(formElem.action, {
          method: 'POST',
          body: data,
        }).then((rq) => {
          if (rq.state && rq.state.code === 4000) {
            // console.log('here?');
            // clearTimeout(timeClock);
            // const BarInfo = that.props.selfState.get('upgradeBarInfo')
            //                       .setIn(['firstBar', 'start'], false)
            //                       .set('isShow', false);
            // that.props.changeUpgradeBarInfo(BarInfo);
            that.props.resetSelfState();
            that.props.createModal({
              id: 'settings',
              role: 'alert',
              text: _('File verification failed! Please upload the right upgrading file.'),
            });
          }
        });
      } else {
        formElem.submit();
      }
    }

    this.props.createModal({
      id: 'settings',
      role: 'comfirm',
      text: _('Sure you want to UPGRADE the software and REBOOT ?'),
      apply: upgradeDevice,
    });
  }

  onConfigurationRestore(e) {
    const that = this;
    const input = document.getElementById('restoreFile');
    const formElem = document.getElementById('restoreForm');
    let data;
    e.preventDefault();

    if (!input.value) {
      return;
    }
    const extension = utils.getExtension(input.value);
    function saveConfig() {
      if (typeof FormData === 'function') {
        data = new FormData();
        data.append('filename', input.files[0]);
        data.append('suffix', extension);
        const step = Promise.resolve();
        step.then(() => {
          const barInfo = that.props.selfState.get('progressBarInfo')
                          .set('title', _('The configuration is restoring now, please wait ...'))
                          .set('time', 120).set('isShow', true).set('start', false);
          that.props.changeProgressBarInfo(barInfo);
        }).then(() => {
          const barInfo = that.props.selfState.get('progressBarInfo').set('start', true);
          that.props.changeProgressBarInfo(barInfo);
        });

        that.props.fetch(formElem.action, {
          method: 'POST',
          body: data,
        }).then((rq) => {
          if (rq.state && rq.state.code === 4000) {
            // clearTimeout(timeClock);
            that.props.resetSelfState();
            that.props.createModal({
              id: 'settings',
              role: 'alert',
              text: _('Save configuration failed !'),
            });
          }
        });
      } else {
        formElem.submit();
      }
    }

    this.props.createModal({
      id: 'settings',
      role: 'comfirm',
      text: _('Sure you want to RESTORE the configuration and REBOOT ?'),
      apply: saveConfig,
    });
  }

  onRebootDevice() {
    const that = this;
    function rebootDevice() {
      utils.save('goform/reboot');
      const step = Promise.resolve();
      step.then(() => {
        that.props.changeProgressBarInfo(fromJS({
          title: _('The device is rebooting now, please wait ...'),
          time: 90,
          isShow: true,
        }));
      }).then(() => {
        const barInfo = that.props.selfState.get('progressBarInfo').set('start', true);
        that.props.changeProgressBarInfo(barInfo);
      });
    }

    this.props.createModal({
      id: 'settings',
      role: 'comfirm',
      text: _('Sure you want to REBOOT the device ?'),
      apply: rebootDevice,
    });
  }

  onResetDevice() {
    const that = this;
    function resetDevice() {
      utils.save('goform/reset');
      const step = Promise.resolve();
      step.then(() => {
        that.props.changeProgressBarInfo(fromJS({
          title: _('The device is reseting now, please wait ...'),
          time: 90,
          isShow: true,
        }));
      }).then(() => {
        const barInfo = that.props.selfState.get('progressBarInfo').set('start', true);
        that.props.changeProgressBarInfo(barInfo);
      });
    }

    this.props.createModal({
      id: 'settings',
      role: 'comfirm',
      text: _('Sure you want to restore the device into factory default ?'),
      apply: resetDevice,
    });
  }

  onBackupConfig() {
    utils.fetch('goform/save_config')
        .then((json) => {
          if (json.state && json.state.code === 2000) {
            window.location = json.data.config_url;
          } else if (json.state && json.state.code === 4000) {
            this.props.createModal({
              id: 'settings',
              role: 'alert',
              text: _('Backup failed! Please try again.'),
            });
          }
        });
  }

  render() {
    return (
      <div className="o-form">
        <div className="o-form__legend">
          {_('Upgrade')}
        </div>
        <form
          action="/cgi-bin/upload.cgi"
          method="POST"
          encType="multipart/form-data"
          id="upgradeForm"
        >
          <FormGroup label={_('Firmware Upgrade')}>
            <FormInput
              type="file"
              name="filename"
              id="upgradeFile"
            />
            <Button
              type="button"
              text={_('Upgrade')}
              onClick={this.onFarewellUpgrade}
            />
          </FormGroup>
        </form>
        <div className="o-form__legend">
          {_('Reboot')}
        </div>
        <FormGroup label={_('Reboot device')}>
          <Button
            text={_('Reboot')}
            onClick={this.onRebootDevice}
          />
        </FormGroup>

        <div className="o-form__legend">
          {_('Configuration')}
        </div>
        <FormGroup label={_('Backup configuration')}>
          <Button
            text={_('Backup')}
            onClick={this.onBackupConfig}
          />
        </FormGroup>

        <form
          id="restoreForm"
          action="/cgi-bin/back_config"
          method="POST"
          encType="multipart/form-data"
        >
          <FormGroup
            label={_('Restore configuration')}
          >
            <FormInput
              type="file"
              id="restoreFile"
            />
            <Button
              text={_('Restore')}
              onClick={this.onConfigurationRestore}
            />
          </FormGroup>
        </form>
        <FormGroup
          label={_('Reset configuration')}
        >
          <Button
            text={_('Reset')}
            onClick={this.onResetDevice}
          />
        </FormGroup>

        <Modal
          className="upgradeBar"
          isShow={this.props.selfState.getIn(['upgradeBarInfo', 'isShow'])}
          style={{
            top: '200px',
            borderRadius: '20px',
          }}
          noFooter
        >
          <ProgressBar
            title={this.props.selfState.getIn(['upgradeBarInfo', 'firstBar', 'title'])}
            time={this.props.selfState.getIn(['upgradeBarInfo', 'firstBar', 'time'])}
            callback={() => {
              const txt = 'Upgrading, please DO NOT cut the power !';
              const upgradeBarInfo = this.props.selfState.get('upgradeBarInfo')
                                        .setIn(['secondBar', 'start'], true)
                                        .setIn(['firstBar', 'title'], txt);
              this.props.changeUpgradeBarInfo(upgradeBarInfo);
            }}
            start={this.props.selfState.getIn(['upgradeBarInfo', 'firstBar', 'start'])}
          />
          <ProgressBar
            title={this.props.selfState.getIn(['upgradeBarInfo', 'secondBar', 'title'])}
            time={this.props.selfState.getIn(['upgradeBarInfo', 'secondBar', 'time'])}
            callback={() => {
              window.location.href = '#';
              this.props.resetSelfState();
            }}
            start={this.props.selfState.getIn(['upgradeBarInfo', 'secondBar', 'start'])}
          />
        </Modal>
        <Modal
          className="excUpgradeBar"
          isShow={this.props.selfState.getIn(['progressBarInfo', 'isShow'])}
          style={{
            top: '200px',
            borderRadius: '20px',
          }}
          noFooter
        >
          <ProgressBar
            title={this.props.selfState.getIn(['progressBarInfo', 'title'])}
            time={this.props.selfState.getIn(['progressBarInfo', 'time'])}
            callback={() => {
              window.location.href = '#';
              this.props.resetSelfState();
            }}
            start={this.props.selfState.getIn(['progressBarInfo', 'start'])}
          />
        </Modal>
      </div>
    );
  }
}

SystemMaintenance.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    app: state.app,
    selfState: state.systemmaintenance,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    utils.extend({}, appActions, settingActions, selfActions),
    dispatch
  );
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(SystemMaintenance);

export const systemmaintenance = reducer;
