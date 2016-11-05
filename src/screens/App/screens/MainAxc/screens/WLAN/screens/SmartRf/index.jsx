import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import { bindActionCreators } from 'redux';
import {
  FormGroup, SaveButton, FormInput,
} from 'shared/components';
import channels from 'shared/config/country.json';
import * as appActions from 'shared/actions/app';
import * as actions from 'shared/actions/settings';

const channelsList = List(channels);
const countryOptions = channelsList.map(item => ({
  value: item.country,
  label: b28n.getLang() === 'cn' ? _(item.cn) : _(item.en),
})).toJS();

const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  groupid: PropTypes.any,

  route: PropTypes.object,
  saveSettings: PropTypes.func,
  fetchSettings: PropTypes.func,
  updateItemSettings: PropTypes.func,
  changeSettingsQuery: PropTypes.func,
  leaveSettingsScreen: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
  }
  componentWillMount() {
    const props = this.props;
    const groupid = props.groupid || -1;

    props.initSettings({
      settingId: props.route.id,
      formUrl: props.route.formUrl,
      defaultData: {
        '5gFrist': '1',
        '11nFrist': '1',
        terminalRelease: '1',
        terminalReleaseVal: '75',
        autoPower: '1',
        autoChannel: '1',
        wirelessPower: '20',
        country: 'CN',
        channel: '6',
        groupid,
      },
      query: {
        groupid,
      },
      saveQuery: {},
    });

    props.fetchSettings();
  }
  componentDidUpdate(prevProps) {
    if (this.props.groupid !== prevProps.groupid) {
      this.props.updateItemSettings({
        groupid: this.props.groupid,
      });
      this.props.changeSettingsQuery({
        groupid: this.props.groupid,
      });
      this.props.fetchSettings();
    }
  }

  componentWillUnmount() {
    this.props.leaveSettingsScreen();
  }
  onSave() {
    this.props.saveSettings();
  }

  getChannelsOptions(currCountry) {
    let i;
    let len;
    let channelsRange;
    const channelsOptions = [
      {
        value: '0',
        label: _('auto'),
      },
    ];
    const channelsOption = channelsList.find((item) => {
      return item.country === currCountry;
    });

    if (channelsOption) {
      channelsRange = channelsOption['2.4g'].split('-');
      i = parseInt(channelsRange[0], 10);
      len = parseInt(channelsRange[1], 10);
    } else {
      i = 1;
      len = 13;
    }

    for (i; i <= len; i++) {
      channelsOptions.push({
        value: `${i}`,
        label: `${i}`,
      });
    }

    return channelsOptions;
  }

  render() {
    const { route, updateItemSettings } = this.props;
    const curData = this.props.store.getIn(['curData']).toJS();
    const channelsOptions = this.getChannelsOptions(curData.country);

    if (this.props.store.get('curSettingId') === 'base') {
      return null;
    }

    return (
      <form className="o-form">
        <h2 className="o-form__title">{route.text}</h2>
        <fieldset className="o-form__fieldset">
          <legend className="o-form__legend">{_('Base Settings')}</legend>
          <FormGroup
            type="checkbox"
            label={_('5G Frist')}
            checked={curData['5gFrist'] === '1'}
            onChange={item => updateItemSettings({
              '5gFrist': item.value,
            })}
          />
          <FormGroup
            label={_('Terminal Release')}
            value={curData.terminalReleaseVal}
          >
            <FormInput
              type="checkbox"
              checked={curData.terminalRelease === '1'}
              onChange={item => updateItemSettings({
                terminalRelease: item.value,
              })}
            />
            <FormInput
              type="text"
              value={curData.terminalReleaseVal}
              maxLength="3"
              size="sm"
              disabled={curData.terminalRelease !== '1'}
              onChange={item => updateItemSettings({
                terminalReleaseVal: item.value,
              })}
            />
          </FormGroup>
          <FormGroup
            type="checkbox"
            label={_('11n Frist')}
            checked={curData['11nFrist'] === '1'}
            onChange={item => updateItemSettings({
              '11nFrist': item.value,
            })}
          />
        </fieldset>
        <fieldset className="o-form__fieldset">
          <legend className="o-form__legend">{_('Wireless Power')}</legend>
          <FormGroup
            type="checkbox"
            label={_('Power Auto')}
            checked={curData.autoBandwidth === '1'}
            onChange={item => updateItemSettings({
              autoBandwidth: item.value,
            })}
          />
          {
            curData.autoBandwidth !== '1' ? (
              <FormGroup
                type="range"
                min="1"
                max="100"
                label={_('Wireless Power')}
                unit="%"
                value={parseInt(curData.wirelessPower, 10)}
                onChange={item => updateItemSettings({
                  wirelessPower: item.value,
                })}
              />
            ) : null
          }
        </fieldset>
        <fieldset className="o-form__fieldset">
          <legend className="o-form__legend">{_('Wireless Channel')}</legend>
          <FormGroup
            type="select"
            label={_('Country')}
            options={countryOptions}
            value={curData.country}
            onChange={item => updateItemSettings({
              country: item.value,
            })}
          />
          <FormGroup
            type="checkbox"
            label={_('Channel Auto')}
            value="1"
            checked={curData.autoChannel === '1'}
            onChange={item => updateItemSettings({
              autoChannel: item.value,
            })}
          />

          <div className="form-group form-group--save">
            <div className="form-control">
              <SaveButton
                type="button"
                loading={this.props.app.get('saving')}
                onClick={this.onSave}
              />
            </div>
          </div>
        </fieldset>
      </form>
    );
  }
}

View.propTypes = propTypes;
View.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    groupid: state.product.getIn(['group', 'selected', 'id']),
    store: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    actions
  ), dispatch);
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps
)(View);
