import React from 'react';
import PropTypes from 'prop-types';
import { fromJS, Map } from 'immutable';
import utils from 'shared/utils';
import { PureComponent, WizardContainer, FormGroup } from 'shared/components/';
import DropzoneComponent from 'react-dropzone-component/dist/react-dropzone';
import 'dropzone/dist/min/dropzone.min.css';

import './_style.scss';

const msg = {
  password: __('Password'),
  versionUses: __('Version Description'),
  selectFile: __('Firmware File'),
  dictDefaultMessage: __('Drop or click to select file'),
  removefile: __('Remove File'),
  cancelUpload: __('Cancel upload'),
  currentVersion: __('Current Firmware Version'),
  upAcVersionTitle: __('Upgrading Firmware'),
  backupAcVersion: __('Backup AC Firmware'),
  sureUpgradeAc: __('Are you sure to UPGRADE the Firmware and REBOOT?'),
  upgradingACversion: __('Upgrading AC Firmware version, please do not shut down device.'),
  backupingAcVersion: __('Backup AC Firmware'),
};
let checkUpgradOkTimeout = null;

const propTypes = {
  app: PropTypes.instanceOf(Map),
  save: PropTypes.func,
  createModal: PropTypes.func,
  fetchProductInfo: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  changeModalState: PropTypes.func.isRequired,
  onReboot: PropTypes.func,
  changeLoginStatus: PropTypes.func.isRequired,
  changeLoginState: PropTypes.func.isRequired,
  actionable: PropTypes.bool,
  loadingStep: PropTypes.number,
};
const defaultProps = {
  actionable: true,
};
export default class AcVersion extends PureComponent {
  constructor(props) {
    super(props);

    utils.binds(this,
      [
        'renderStepOne', 'onBeforeStep', 'upgradeAc', 'doUpgradeAc',
        'acUploading', 'checkUpgradOk', 'renderStepThree', 'onComplete',
      ],
    );
    this.state = {
      versionUses: '0',
      filename: '',
      fileUploaded: false,
      initStep: 0,
    };
  }

  onComplete() {
    this.setState({
      initStep: 0,
      fileUploaded: false,
    });
    this.props.changeLoginStatus('0');
    this.props.changeLoginState({
      needReload: true,
    });
    window.location.hash = '#';
  }

  onBeforeStep(data) {
    const { targetStep, currStep } = data;
    let ret = '';

    // next
    if (targetStep > currStep) {
      if (currStep === 0) {
        ret = this.upgradeAc();
      }
    }

    return ret;
  }

  doUpgradeAc() {
    this.props.createModal({
      role: 'loading',
      title: '',
      loadingStep: this.props.loadingStep,
      loadingCurStep: 1,
      loadingTitle: msg.upgradingACversion,
      onLoaded: () => {
        this.props.closeModal();
        this.setState({
          initStep: 2,
        });
      },
    });

    this.props.onReboot();
    this.checkUpgradOk(true);
  }

  checkUpgradOk(isFirst) {
    let timeoutTime = 5000;

    if (!isFirst) {
      this.props.fetchProductInfo('goform/axcInfo')
        .then((json) => {
          if (json && json.state && json.state.code === 2000) {
            clearTimeout(checkUpgradOkTimeout);
            this.props.changeModalState({
              loadingStep: 10,
            });
          }
        });

    // 第一次 需要个长时间让 后台可以杀进程
    } else {
      timeoutTime = 30000;
    }
    checkUpgradOkTimeout = setTimeout(() => {
      this.checkUpgradOk();
    }, timeoutTime);
  }
  upgradeAc() {
    const { filename } = this.state;
    const url = 'goform/system/version/upgrade';
    const promise = new Promise((resolve, reject) => {
      this.props.createModal({
        role: 'confirm',
        title: msg.upAcVersionTitle,
        text: msg.sureUpgradeAc,
        apply: () => {
          let resultMsg = '';

          this.props.createModal({
            role: 'loading',
            title: '',
            loadingStep: 300,
            loadingTitle: __('Checking firmware...'),
            onLoaded: () => {
              resolve(resultMsg);
            },
          });
          this.props.save(url, { filename })
            .then((json) => {
              if (json && json.state.code !== 2000) {
                resultMsg = __(' ');
                resolve(resultMsg);
                this.props.closeModal();
              } else {
                this.props.changeModalState({
                  loadingStep: 1,
                });
              }
            });
        },
        cancel: () => reject(),
      });
    });

    return promise.then(
      (msgStr) => {
        if (!msgStr) {
          this.doUpgradeAc();
        }
        return msgStr;
      },
    );
  }

  renderStepOne() {
    const { app } = this.props;
    const componentConfig = {
      postUrl: 'goform/system/version/upload',
    };
    const eventHandlers = {
      removedfile: () => {
        this.setState({
          fileUploaded: false,
          filename: '',
        });
      },
      // error: (file) => {
      // },
      processing: null,
      uploadprogress: null,
      sending: null,
      success: (file) => {
        this.setState({
          fileUploaded: true,
          filename: file.name,
        });
      },
      complete() {

      },
      canceled: null,
      maxfilesreached: null,
      maxfilesexceeded: null,
      // All of these receive a list of files as first parameter
      // and are only called if the uploadMultiple option
      // in djsConfig is true:
      processingmultiple: null,
      sendingmultiple: null,
      successmultiple: null,
      completemultiple: null,
      canceledmultiple: null,
      // Special Events
      totaluploadprogress: null,
      reset: null,
      queuecomplete: null,
    };
    const djsConfig = {
      paramName: 'versionFile',
      maxFiles: 1,
      maxFilesize: 1024,
      addRemoveLinks: 'dictCancelUploadConfirmation',
      dictDefaultMessage: msg.dictDefaultMessage,
      dictRemoveFile: msg.removefile,
      dictCancelUpload: msg.cancelUpload,
    };

    return (
      <div className="ac-version">
        <FormGroup
          type="plain-text"
          label={msg.currentVersion}
          value={app.getIn(['version'])}
        />
        {
          /*
            <FormGroup
            label={msg.versionUses}
            type="switch"
            name="versionUses"
            options={versionUsesOptions}
            value={this.state.versionUses}
            onChange={data => this.setState({
              versionUses: data.value,
            })}
          />
          */
        }

        <FormGroup
          label={msg.selectFile}
          disabled={!this.props.actionable}
        >
          {
            this.props.actionable ? (
              <DropzoneComponent
                config={componentConfig}
                eventHandlers={eventHandlers}
                djsConfig={djsConfig}
              />
            ) : null
          }
        </FormGroup>
      </div>
    );
  }
  renderStepThree() {
    const { app } = this.props;
    return (
      <div className="step-1">
        <FormGroup
          type="plain-text"
          label={msg.currentVersion}
          value={app.getIn(['version'])}
        />
      </div>
    );
  }

  render() {
    const { versionUses, initStep } = this.state;
    const stepTwoTitleArr = [
      msg.upAcVersionTitle,
      msg.backupAcVersion,
    ];
    const options = fromJS([
      {
        title: __('Upload Firmware'),
        render: this.renderStepOne,
      }, {
        title: stepTwoTitleArr[versionUses],
        render: () => {
          let ret = msg.upgradingACversion;

          if (versionUses === '1') {
            ret = msg.backupingAcVersion;
          }

          return ret;
        },
      }, {
        title: __('Completed'),
        render: this.renderStepThree,
      },
    ]);

    return (
      <WizardContainer
        title={__('AC Firmware Management Wizard')}
        options={options}
        onBeforeStep={this.onBeforeStep}
        onCompleted={this.onComplete}
        size="sm"
        nextDisabled={!this.state.fileUploaded}
        initStep={initStep}
      />
    );
  }
}

AcVersion.propTypes = propTypes;
AcVersion.defaultProps = defaultProps;
