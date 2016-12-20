import React, { PropTypes } from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import AppScreen from 'shared/components/Template/AppScreen';
import { radioBase, radioAdvance, numberKeys } from 'shared/config/axcRadio';
import * as appActions from 'shared/actions/app';
import * as screenActions from 'shared/actions/screens';
import FormContainer from 'shared/components/Organism/FormContainer';
import Icon from 'shared/components/Icon';

const settingsFormOptions = radioBase
  // 添加自动功率
  .map(
    ($$item) => {
      const curId = $$item.get('id');

      switch (curId) {
        // 功率添加自动选项
        case 'phymode':
          return $$item.updateIn(
            ['options'],
            $$options => $$options.unshift(Map({
              value: 0,
              label: _('Automatic'),
            })),
          ).set('disabled', true);

        // 功率添加自动选项
        case 'txpower':
          return $$item.updateIn(
            ['options'],
            $$options => $$options.unshift(Map({
              value: 'auto',
              label: _('Automatic'),
            })),
          ).set('disabled', true);

        // 信道只支持自动
        case 'channel':
          return $$item.set(
            'options',
            fromJS([
              {
                value: 0,
                label: _('Automatic'),
              },
            ]),
          ).set('disabled', true);

        // 5G优先,  11n优先
        case 'first5g':
        case 'switch11n':
          return $$item.set(
              'label',
              $$item.get('text'),
            ).delete('text');

        default:
      }

      return $$item;
    },
  )
  .rest()
  .butLast()
  .groupBy(
    item => item.get('fieldset'),
  )
  .toList();

const $$radioAdvanceFormOptions = radioAdvance.filterNot(
  ($$item) => {
    let ret = false;
    const curId = $$item.get('id');

    if (curId === 'rateset' || curId === 'txchain' ||
        curId === 'rxchain') {
      ret = true;
    }

    return ret;
  },
);

const propTypes = {
  app: PropTypes.instanceOf(Map),
  screenStore: PropTypes.instanceOf(Map),
  groupid: PropTypes.any,

  changeScreenQuery: PropTypes.func,
  fetchScreenData: PropTypes.func,
  updateScreenSettings: PropTypes.func,
  saveScreenSettings: PropTypes.func,
  validateAll: PropTypes.func,
};
const defaultProps = {};

export default class SmartRf extends React.Component {
  constructor(props) {
    const groupid = props.groupid || -1;

    super(props);
    this.state = {
      defaultSettingsData: {
        first5g: 1,
        switch11n: 1,
        txpower: 'auto',
        countrycode: 'CN',
        channel: 0,
        channelwidth: 40,
        groupid,
      },
      isBaseShow: true,
      isAdvancedShow: true,
    };
    utils.binds(this, [
      'onSave',
    ]);
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupid !== prevProps.groupid) {
      this.props.updateScreenSettings({
        groupid: this.props.groupid,
      });
      this.props.changeScreenQuery({
        groupid: this.props.groupid,
      });
      this.props.fetchScreenData();
    }
  }
  onSave(formId) {
    if (this.props.validateAll) {
      this.props.validateAll(formId)
        .then((errMsg) => {
          if (errMsg.isEmpty()) {
            this.props.saveScreenSettings({
              onlyChanged: true,
              numberKeys: fromJS(numberKeys),
            });
          }
        });
    }
  }
  toggleBox(moduleName) {
    this.setState({
      [moduleName]: !this.state[moduleName],
    });
  }
  render() {
    const { app, screenStore, updateScreenSettings } = this.props;
    const { defaultSettingsData } = this.state;
    const myScreenId = screenStore.get('curScreenId');
    const $$curData = screenStore.getIn([myScreenId, 'curSettings']);

    return (
      <AppScreen
        {...this.props}
        store={screenStore}
        defaultSettingsData={defaultSettingsData}
      >
        <div className="o-box row">
          <div className="o-box__cell">
            <h3
              style={{ cursor: 'pointer' }}
              onClick={() => this.toggleBox('isBaseShow')}
            >
              <Icon
                name={this.state.isBaseShow ? 'minus-square' : 'plus-square'}
                size="lg"
                style={{
                  marginRight: '5px',
                }}
              />
              {_('Base Settings')}
            </h3>
          </div>
          {
            this.state.isBaseShow ? (
              <div className="o-box__cell">
                <FormContainer
                  id="radioBase"
                  options={settingsFormOptions}
                  data={$$curData}
                  onChangeData={updateScreenSettings}
                  onSave={() => this.onSave('radioBase')}
                  invalidMsg={app.get('invalid')}
                  validateAt={app.get('validateAt')}
                  isSaving={app.get('saving')}
                  hasSaveButton
                />
              </div>
            ) : null
          }

          <div className="o-box__cell">
            <h3
              style={{ cursor: 'pointer' }}
              onClick={() => this.toggleBox('isAdvancedShow')}
            >
              <Icon
                name={this.state.isAdvancedShow ? 'minus-square' : 'plus-square'}
                size="lg"
                style={{
                  marginRight: '5px',
                }}
                onClick={() => this.toggleBox('isAdvancedShow')}
              />
              {_('Advanced Settings')}
            </h3>
          </div>
          {
            this.state.isAdvancedShow ? (
              <div className="o-box__cell">
                <FormContainer
                  id="radioAdvance"
                  options={$$radioAdvanceFormOptions}
                  data={$$curData}
                  onChangeData={updateScreenSettings}
                  onSave={() => this.onSave('radioAdvance')}
                  invalidMsg={app.get('invalid')}
                  validateAt={app.get('validateAt')}
                  isSaving={app.get('saving')}
                  hasSaveButton
                />
              </div>
            ) : null
          }
        </div>
      </AppScreen>
    );
  }
}

SmartRf.propTypes = propTypes;
SmartRf.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    screenStore: state.screens,
    groupid: state.product.getIn(['group', 'selected', 'id']),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    screenActions,
  ), dispatch);
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SmartRf);
