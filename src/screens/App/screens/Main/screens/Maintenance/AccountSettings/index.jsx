import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  SaveButton, FormGroup, Modal,
} from 'shared/components';

import validator from 'shared/utils/lib/validator';
import * as appActions from 'shared/actions/app';
import * as settingsActions from 'shared/actions/settings';
import utils from 'shared/utils';
import * as selfActions from './actions';
import reducer from './reducer';

const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  selfState: PropTypes.instanceOf(Map),

  fetch: PropTypes.func,
  updateItemSettings: PropTypes.func,
  initSettings: PropTypes.func,
  onAccuntSave: PropTypes.func,
  showValidMsg: PropTypes.func,

  validateOption: PropTypes.object,
  resetVaildateMsg: PropTypes.func,
};

const validOptions = Map({
  validOld: validator({
    rules: 'pwd|len:[6, 32]',
  }),
  validNew: validator({
    rules: 'pwd|len:[6, 32]',
  }),
  validCfm: validator({
    rules: 'pwd|len:[6, 32]',
  }),
});

export default class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.onAccuntSave = this.onAccuntSave.bind(this);
    this.onModalOkBtnClick = this.onModalOkBtnClick.bind(this);
  }

  componentWillMount() {
    const props = this.props;
    props.initSettings({
      settingId: props.route.id,
      saveUrl: props.route.saveUrl,
      defaultData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    });
    props.showValidMsg('0', '');
  }

  componentWillUnmount() {
    this.props.resetVaildateMsg();
  }
  onAccuntSave() {
    const props = this.props;
    const store = props.store;
    let noError = true;
    const oldPassword = store.getIn(['curData', 'oldPassword']);
    const newPassword = store.getIn(['curData', 'newPassword']);
    const confirmPassword = store.getIn(['curData', 'confirmPassword']);

    props.validateAll()
        .then(msg => {
          if (msg.isEmpty()) {
            if (newPassword !== confirmPassword) {
              const text = _('Please make sure that the new passwords you input twice are the same!');
              props.showValidMsg('1', text);
              noError = false;
              console.log(text);
            } else if (oldPassword === newPassword) {
              const text = _('Please make sure that the new password is different from the old one!');
              props.showValidMsg('1', text);
              noError = false;
              console.log(text);
            }
            const query = {
              oldPassword, newPassword,
            };
            if (noError === true) {
              props.save('goform/set_password', query)
                  .then((json) => {
                    if (json.state && json.state.code === 4000) {
                      const text = json.state.msg;
                      props.showValidMsg('1', text);
                      console.log(text);
                    }
                  });
            }
          }
        });
  }

  onModalOkBtnClick() {
    this.props.showValidMsg('0', '');
  }

  render() {
    const { validOld, validNew, validCfm } = this.props.validateOption;
    let curData = {};
    if (!this.props.store.get('curData').isEmpty()) {
      curData = this.props.store.get('curData').toJS();
    }
    const { oldPassword, newPassword, confirmPassword } = curData;
    return (
      <div>
        <div>
          <h3>{_('Accounts Settings')}</h3>
          <FormGroup
            type="password"
            label={_('Old Password')}
            value={oldPassword}
            onChange={(data) => {
              this.props.updateItemSettings({
                oldPassword: data.value,
              });
            }}
            required
            {...validOld}
          />
          <FormGroup
            type="password"
            label={_('New Password')}
            value={newPassword}
            onChange={(data) => {
              this.props.updateItemSettings({
                newPassword: data.value,
              });
            }}
            required
            {...validNew}
          />
          <FormGroup
            type="password"
            label={_('Confirm Password')}
            value={confirmPassword}
            onChange={(data) => {
              this.props.updateItemSettings({
                confirmPassword: data.value,
              });
            }}
            required
            {...validCfm}
          />
        </div>
        <FormGroup>
          <SaveButton
            loading={this.props.app.get('fetching')}
            onClick={this.onAccuntSave}
          />
        </FormGroup>
        <Modal
          isShow={this.props.selfState.get('showErrorMsg') === '1'}
          onClose={this.onModalOkBtnClick}
          onOk={this.onModalOkBtnClick}
          okText={_('OK')}
          title={_('Error Message')}
          size="min"
          cancelButton={false}
        >
          {this.props.selfState.get('errorMsg')}
        </Modal>
      </div>
    );
  }
}

AccountSettings.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.settings,
    selfState: state.accountsettings,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    utils.extend({}, appActions, settingsActions, selfActions),
    dispatch
  );
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions)
)(AccountSettings);

export const accountsettings = reducer;
