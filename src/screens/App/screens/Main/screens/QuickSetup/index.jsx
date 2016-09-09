import React, { PropTypes } from 'react';
import { fromJS, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'shared/utils';
import { FormGroup, FormInput, SaveButton, Button } from 'shared/components';
import * as appActions from 'shared/actions/app';
import * as settingActions from 'shared/actions/settings';
import * as selfActions from './actions.js';
import reducer from './reducer.js';

const propTypes = {
  selfState: PropTypes.instanceOf(Map),
  changePage: PropTypes.func,
  changeDeviceMode: PropTypes.func,
};

const defaultState = {};

export default class QuickSetup extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.changePage('1');
  }

  render() {
    const { page, deviceMode } = this.props.selfState.toJS();
    return (
      <div className="wrapall">
        {
          page === '1' ? (
            <div className="firstScreen">
              <h3>{_('Operation Mode')}</h3>
              <div
                className="clearfix"
                style={{
                  paddingTop: '10px',
                }}
              >
                <div className="cols">
                  <FormGroup
                    className="cols col-4"
                    type="radio"
                    text="AP"
                    value="ap"
                    checked={this.props.selfState.get('deviceMode') === 'ap'}
                    name="modeSelect"
                    onChange={(data) => { this.props.changeDeviceMode(data.value); }}
                  />
                  <div
                    className="cols col-7"
                    style={{
                      marginLeft: '-60px',
                    }}
                  >
                    type="plain-text"value="tthis is the info of stationthis is the info of stationthis is the info of stationthis is the in fo of stationthis is the info of stationthis is the info of stationthis is the info o
                  </div>
                </div>
              </div>
              <div
                className="clearfix"
                style={{
                  paddingTop: '10px',
                }}
              >
                <div className="cols">
                  <FormGroup
                    className="cols col-4"
                    type="radio"
                    value="station"
                    text="Station"
                    name="modeSelect"
                    checked={this.props.selfState.get('deviceMode') === 'station'}
                    onChange={(data) => { this.props.changeDeviceMode(data.value); }}
                  />
                  <div
                    className="cols col-7"
                    style={{
                      marginLeft: '-60px',
                    }}
                  >
                    type="plain-text"value="tthis is the info of stationthis is the infoof stationthis is the info of stationthis is the info of stationthis is the info of stationthis is the
                  </div>
                </div>
              </div>
              <div
                className="clearfix"
                style={{
                  paddingTop: '10px',
                }}
              >
                <div className="cols">
                  <FormGroup
                    className="cols col-4"
                    type="radio"
                    value="repeater"
                    text="Repeater"
                    name="modeSelect"
                    checked={this.props.selfState.get('deviceMode') === 'repeater'}
                    onChange={(data) => { this.props.changeDeviceMode(data.value); }}
                  />
                  <div
                    className="cols col-7"
                    style={{
                      marginLeft: '-60px',
                    }}
                  >
                    type="plain-text" value="tthis is the info of stationthis is the info of stationthis is the info of stationthis is the in fo of stationthis is the info of stationthis is the
                  </div>
                </div>
              </div>
              <FormGroup>
                <Button
                  theme="primary"
                  text={_('Next ->')}
                  onClick={() => { this.props.changePage('2'); }}
                />
              </FormGroup>
            </div>
          ) : null
        }

        {
          page === '2' ? (
            <div className="secondScreen">
            {
              deviceMode === 'ap' ? (
                <div className="secondForAp">
                  <h2>{_('Scene: Access Point')}</h2>
                  <h3>{_('LAN Settings')}</h3>
                  <FormGroup
                    label={_('IP Address')}
                    type="text"
                  />
                  <FormGroup
                    label={_('Subnet Mask')}
                    type="text"
                  />
                  <FormGroup
                    label={_('Gateway')}
                    type="text"
                  />
                  <FormGroup
                    label={_('NDS Server')}
                    type="text"
                  />
                </div>
              ) : null
            }

            {
              deviceMode === 'station' ? (
                <div className="secondForSta">
                  <h2>{_('Scene: Station')}</h2>
                  <h3>{_('Wireless Settings')}</h3>
                  <FormGroup
                    label={_('Country')}
                    type="select"
                  />
                  <div className="clearfix">
                    <FormGroup
                      className="fl"
                      label={_('SSID')}
                      type="text"
                    />
                    <Button
                      className="fl"
                      text={_('Scan')}
                      style={{
                        marginTop: '3px',
                        marginLeft: '4px',
                      }}
                    />
                  </div>
                  <FormGroup
                    label={_('Password')}
                    type="password"
                  />
                  <FormGroup
                    label={_('Lock To AP')}
                    type="checkbox"
                  />
                </div>
              ) : null
            }

            {
              deviceMode === 'repeater' ? (
                <div className="secondForRepeater">
                  <h2>{_('Scene: Repeater')}</h2>
                  <h3>{_('LAN Settings')}</h3>
                  <FormGroup>
                    <FormInput
                      type="radio"
                      name="networkMode"
                      text={_('Static IP')}
                    />
                    <FormInput
                      type="radio"
                      name="networkMode"
                      text={_('DHCP')}
                      style={{
                        marginLeft: '20px',
                      }}
                    />
                  </FormGroup>
                  <FormGroup
                    type="text"
                    label={_('IP Address')}
                  />
                  <FormGroup
                    type="text"
                    label={_('Mask')}
                  />
                  <FormGroup
                    type="text"
                    label={_('Gateway')}
                  />
                  <FormGroup
                    type="text"
                    label={_('DNS')}
                  />
                </div>
              ) : null
            }

              <FormGroup>
                <Button
                  text={_('<- Previous')}
                  onClick={() => { this.props.changePage('1'); }}
                />&nbsp;&nbsp;&nbsp;
                <Button
                  theme="primary"
                  text={_('Next ->')}
                  onClick={() => { this.props.changePage('3'); }}
                />
              </FormGroup>
            </div>
          ) : null

        }

        {
          page === '3' ? (
            <div className="thirdScreen">
            {
              deviceMode === 'ap' ? (
                <div className="thirdForAp">
                  <h2>{_('Scene: Access Point')}</h2>
                  <h3>{_('Current Settings')}</h3>
                  <FormGroup
                    type="plain-text"
                    label={_('Device IP Address')}
                    value="192.168.1.1"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Device Mode')}
                    value="Access Point"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Frequency')}
                    value="5GHz"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Country')}
                    value="CN(China)"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('SSID')}
                    value="axilspot"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Security')}
                    value="wpa"
                  />
                  <FormGroup>
                    <Button
                      text={_('<- Previous')}
                      onClick={() => { this.props.changePage('2'); }}
                    />&nbsp;&nbsp;&nbsp;
                    <SaveButton
                      text={_('Complete')}
                    />
                  </FormGroup>
                </div>
              ) : null
            }

            {
              deviceMode === 'station' ? (
                <div className="thirdForSta">
                  <h2>{_('Scene: Station')}</h2>
                  <h3>{_('Current Settings')}</h3>
                  <FormGroup
                    type="plain-text"
                    label={_('Device IP Address')}
                    value="192.168.1.1"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Device Mode')}
                    value="Station"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Frequency')}
                    value="5GHz"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Country')}
                    value="CN(China)"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('SSID')}
                    value="axilspot"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Security')}
                    value="wpa"
                  />
                  <FormGroup
                    type="plain-text"
                    label={_('Lock To')}
                    value="11:11:11:11:11:11"
                  />

                  <FormGroup>
                    <Button
                      text={_('<- Previous')}
                      onClick={() => { this.props.changePage('2'); }}
                    />&nbsp;&nbsp;&nbsp;
                    <SaveButton
                      text={_('Complete')}
                    />
                  </FormGroup>
                </div>
              ) : null
            }

            {
              deviceMode === 'repeater' ? (
                <div className="thirdForRepeater">
                  <h2>{_('Scene: Repeater')}</h2>
                  <h3>{_('Wireless Settings')}</h3>
                  <div className="clearfix">
                    <FormGroup
                      className="fl"
                      label="SSID"
                      type="text"
                    />
                    <Button
                      className="fl"
                      text={_('Scan')}
                      style={{
                        marginTop: '3px',
                        marginLeft: '4px',
                      }}
                    />
                  </div>
                  <FormGroup
                    label={_('Password')}
                    type="password"
                  />
                  <FormGroup
                    label={_('Lock To')}
                    type="checkbox"
                  />
                  <FormGroup>
                    <Button
                      text={_('<- Previous')}
                      onClick={() => { this.props.changePage('2'); }}
                    />&nbsp;&nbsp;&nbsp;
                    <Button
                      text={_('Next ->')}
                      theme="primary"
                      onClick={() => { this.props.changePage('4'); }}
                    />
                  </FormGroup>
                </div>
              ) : null
            }
            </div>
          ) : null
        }

        {
          page === '4' ? (
            <div className="fourthScreenForRepeater">
              <h2>{_('Scene: Repeater')}</h2>
              <h3>{_('Current Settings')}</h3>
              <FormGroup
                type="plain-text"
                label={_('Device IP Address')}
                value="192.168.1.1"
              />
              <FormGroup
                type="plain-text"
                label={_('Device Mode')}
                value="Station"
              />
              <FormGroup
                type="plain-text"
                label={_('Frequency')}
                value="5GHz"
              />
              <FormGroup
                type="plain-text"
                label={_('Country')}
                value="CN(China)"
              />
              <FormGroup
                type="plain-text"
                label={_('SSID')}
                value="axilspot"
              />
              <FormGroup
                type="plain-text"
                label={_('Security')}
                value="wpa"
              />
              <FormGroup
                type="plain-text"
                label={_('Lock To')}
                value="11:11:11:11:11:11"
              />

              <FormGroup>
                <Button
                  text={_('<- Previous')}
                  onClick={() => { this.props.changePage('3'); }}
                />&nbsp;&nbsp;&nbsp;
                <SaveButton
                  text={_('Complete')}
                />
              </FormGroup>
            </div>
          ) : null
        }
      </div>
    );
  }
}

QuickSetup.propTypes = propTypes;
QuickSetup.defaultState = defaultState;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.settings,
    selfState: state.quicksetup,
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
)(QuickSetup);

export const quicksetup = reducer;
