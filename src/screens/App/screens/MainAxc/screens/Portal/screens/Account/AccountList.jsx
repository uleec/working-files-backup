import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import utils from 'shared/utils';
import validator from 'shared/validator';
import AppScreen from 'shared/components/Template/AppScreen';
import FormContainer from 'shared/components/Organism/FormContainer';
import Icon from 'shared/components/Icon';
// custom
import * as appActions from 'shared/actions/app';
import * as screenActions from 'shared/actions/screens';
import * as propertiesActions from 'shared/actions/properties';
import { Button } from 'shared/components/Button';

function getCardCategoryName() {
  return utils.fetch('goform/portal/card/cardcategory', {
    size: 9999,
    page: 1,
  })
    .then(json => (
      {
        options: json.data.list.map(
          item => ({
            value: item.id,
            label: item.name,
          }),
        ),
      }
    ),
  );
}
function getCardInformation() {
  return utils.fetch('goform/portal/card/cardcategory', {
    size: 9999,
    page: 1,
  }).then((json) => {
    if (json.state && json.state.code === 2000) {
      return fromJS(json.data.list);
    }
    return fromJS([]);
  });
}

const uptimeFilter = utils.filter('connectTime');

// 列表相关配置
const listOptions = fromJS([
  {
    id: 'loginName',
    text: _('Login Name'),
  }, {
    id: 'date',
    text: _('Expired Date'),
    noForm: true,
  }, {
    id: 'time',
    text: _('Left Time'),
    noForm: true,
    transform(val) {
      return uptimeFilter.transform(val / 1000);
    },
  }, {
    id: 'octets',
    text: _('Left Traffic'),
    noForm: true,
  }, {
    id: 'password',
    text: _('Password'),
    type: 'pwd',
    noTable: true,
  }, {
    id: 'ex1',
    text: _('Question'),
    noTable: true,
  }, {
    id: 'ex2',
    text: _('Answer'),
    noTable: true,
    type: 'text',
  }, {
    id: 'state',
    type: 'text',
    text: _('Type'),
    options: [
      {
        value: '0',
        label: _('Unavailability'),
      }, {
        value: '1',
        label: _('Free of Charge'),
      },
      {
        value: '2',
        label: _('Timekeeping'),
      }, {
        value: '3',
        label: _('Buy Out'),
      }, {
        value: '4',
        label: _('Traffic'),
      },
    ],
    defaultValue: '0',
  }, {
    id: 'maclimit',
    text: _('Mac Limit'),
    options: [
      {
        value: '0',
        label: _('Closed'),
      }, {
        value: '1',
        label: _('Open'),
      },
    ],
    defaultValue: '0',
  }, {
    id: 'maclimitcount',
    text: _('Mac Quantity'),
  }, {
    id: 'autologin',
    text: _('Auto Login'),
    options: [
      {
        value: '0',
        label: _('Closed'),
      }, {
        value: '1',
        label: _('Open'),
      },
    ],
    defaultValue: '0',
  }, {
    id: 'speed',
    text: _('Speed Limit'),
    noForm: true,
    noTable: true,
    options: [
      {
        value: '1',
        label: _('1M'),
      },
    ],
    defaultValue: '1',
  }, {
    id: 'ex4',
    text: _('Last Unbind Month'),
    noForm: true,
    noTable: true,
  }, {
    id: 'ex3',
    text: _('Unbind Times'),
    noForm: true,
    noTable: true,
  }, {
    id: 'name',
    text: _('Name'),
    noTable: true,
  }, {
    id: 'gender',
    text: _('Gender'),
    noTable: true,
    options: [
      {
        value: '0',
        label: _('Male'),
      }, {
        value: '1',
        label: _('Female'),
      },
    ],
    defaultValue: '0',
  }, {
    id: 'idnumber',
    text: _('ID No.'),
    noTable: true,
  }, {
    id: 'phoneNumber',
    text: _('Phone'),
    noTable: true,
  }, {
    id: 'address',
    text: _('Address'),
    noTable: true,
  }, {
    id: 'email',
    text: _('Email'),
    noTable: true,
  }, {
    id: 'description',
    text: _('Detail Information'),
    noTable: true,
  }, {
    id: 'ex5',
    text: _('ex5'),
    noTable: true,
    noForm: true,
  }, {
    id: 'ex6',
    text: _('ex6'),
    noTable: true,
    noForm: true,
  }, {
    id: 'ex7',
    text: _('ex7'),
    noTable: true,
    noForm: true,
  }, {
    id: 'ex8',
    text: _('ex8'),
    noTable: true,
    noForm: true,
  }, {
    id: 'ex9',
    text: _('ex9'),
    noTable: true,
    noForm: true,
  }, {
    id: 'ex10',
    text: _('ex10'),
    noTable: true,
    noForm: true,
  }, {
    id: '__actions__',
    text: _('Actions'),
    transform(val, $$item) {
      return (
        <span>
          <a href={`/index.html#/main/portal/account/list/mac/${$$item.get('loginName')}`} className="tablelink">{_('Mac Management')}</a>
        </span>
      );
    },
  },
]);
export const baseSetting = fromJS([
  {
    id: 'loginName',
    label: _('Login Name'),
    className: 'cols col-6',
    type: 'text',
    required: true,
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  }, {
    id: 'password',
    label: _('Password'),
    className: 'cols col-6',
    type: 'password',
    noTable: true,
    required: true,
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  }, {
    id: 'ex1',
    label: _('Question'),
    className: 'cols col-6',
    noTable: true,
    type: 'text',
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  }, {
    id: 'ex2',
    label: _('Answer'),
    className: 'cols col-6',
    noTable: true,
    type: 'text',
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  }, {
    id: 'state',
    label: _('Type'),
    className: 'cols col-12',
    options: [
      {
        value: '0',
        label: _('Unavailability'),
      }, {
        value: '1',
        label: _('Free of Charge'),
      },
      {
        value: '2',
        label: _('Timekeeping'),
      }, {
        value: '3',
        label: _('Buy Out'),
      }, {
        value: '4',
        label: _('Traffic'),
      },
    ],
    defaultValue: '0',
    type: 'select',
    required: true,
    placeholder: _('Please Select ') + _('Type'),

  }, {
    id: 'maclimit',
    label: _('Mac Limit'),
    className: 'cols col-6',
    options: [
      {
        value: '0',
        label: _('Closed'),
      }, {
        value: '1',
        label: _('Open'),
      },
    ],
    defaultValue: '0',
    type: 'select',
    required: true,
    placeholder: _('Please Select ') + _('Mac Limit'),
  }, {
    id: 'maclimitcount',
    label: _('Mac Quantity'),
    className: 'cols col-6',
    type: 'number',
    min: '0',
    max: '999999',
    required: true,
  }, {
    id: 'autologin',
    label: _('Auto Login'),
    className: 'cols col-6',
    options: [
      {
        value: '0',
        label: _('Closed'),
      }, {
        value: '1',
        label: _('Open'),
      },
    ],
    defaultValue: '0',
    type: 'select',
    required: true,
    placeholder: _('Auto Login') + _('Auto Login'),

  }, {
    id: 'speed',
    label: _('Speed Limit'),
    noForm: true,
    noTable: true,
    className: 'cols col-6',
    options: [
      {
        value: '1',
        label: _('1M'),
      },
    ],
    defaultValue: '0',
    type: 'select',
    required: true,
    placeholder: _('Please Select ') + _('Speed Limit'),
  }, {
    id: 'ex4',
    label: _('Last Unbind Month'),
    className: 'cols col-6',
    type: 'number',
    required: true,
    min: '1',
    max: '12',
  }, {
    id: 'ex3',
    label: _('Unbind Times'),
    className: 'cols col-6',
    type: 'number',
    min: '0',
    max: '999999',
    required: true,
  },
]);

export const advancedSetting = fromJS([
  {
    id: 'name',
    label: _('Name'),
    noTable: true,
    className: 'cols col-12',
    type: 'text',
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  }, {
    id: 'gender',
    label: _('Gender'),
    className: 'cols col-6',
    noTable: true,
    options: [
      {
        value: '0',
        label: _('Male'),
      }, {
        value: '1',
        label: _('Female'),
      },
    ],
    defaultValue: '0',
    type: 'select',
    placeholder: _('Please Select ') + _('Gender'),

  }, {
    id: 'idnumber',
    label: _('ID No.'),
    className: 'cols col-6',
    noTable: true,
    type: 'text',
    maxLength: '19',
    validator: validator({
      rules: 'utf8Len:[1,18]',
    }),
  }, {
    id: 'phoneNumber',
    label: _('Phone'),
    noTable: true,
    className: 'cols col-6',
    type: 'text',
    maxLength: '19',
    validator: validator({
      rules: 'utf8Len:[1,18]',
    }),
  }, {
    id: 'address',
    label: _('Address'),
    className: 'cols col-6',
    noTable: true,
    type: 'text',
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  }, {
    id: 'email',
    label: _('Email'),
    className: 'cols col-6',
    noTable: true,
    type: 'text',
    maxLength: '32',
    validator: validator({
      rules: 'email',
    }),
  }, {
    id: 'description',
    label: _('Detail Information'),
    className: 'cols col-6',
    noTable: true,
    type: 'text',
    maxLength: '255',
    validator: validator({
      rules: 'utf8Len:[1,255]',
    }),
  },
]);
const rechargeOptions = fromJS([
  {
    id: 'loginName',
    label: _('Login Name'),
    form: 'recharge',
    type: 'text',
    disabled: true,
    required: true,
    maxLength: '31',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  },
  {
    id: 'nickname',
    label: _('Name'),
    type: 'text',
    form: 'recharge',
    disabled: true,
    required: true,
    maxLength: '32',
    validator: validator({
      rules: 'utf8Len:[1,31]',
    }),
  },
  {
    id: 'name',
    label: _('Recharge Choices'),
    form: 'recharge',
    required: true,
    type: 'select',
  },
  {
    id: 'state',
    label: _('Type'),
    form: 'recharge',
    type: 'select',
    disabled: true,
    required: true,
    options: [
      {
        value: '0',
        label: _('Hour Card'),
      }, {
        value: '1',
        label: _('Day Card'),
      },
      {
        value: '2',
        label: _('Month Card'),
      }, {
        value: '3',
        label: _('Year Card'),
      }, {
        value: '4',
        label: _('Traffic Card'),
      },
    ],
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
  }, {
    id: 'maclimit',
    label: _('Mac Limit'),
    form: 'recharge',
    disabled: true,
    type: 'select',
    required: true,
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
    options: [
      {
        value: '0',
        label: _('Closed'),
      }, {
        value: '1',
        label: _('Open'),
      },
    ],
  }, {
    id: 'maclimitcount',
    label: _('Mac Quantity'),
    disabled: true,
    form: 'recharge',
    type: 'number',
    required: true,
    min: 0,
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
    validator: validator({
      rules: 'num[0,9999]',
    }),
  }, {
    id: 'autologin',
    label: _('Auto Login'),
    disabled: true,
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
    options: [
      {
        value: '0',
        label: _('Closed'),
      }, {
        value: '1',
        label: _('Open'),
      },
    ],
    type: 'select',
    required: true,
  }, {
    id: 'speed',
    label: _('Speed Limit'),
    disabled: true,
    form: 'recharge',
    type: 'select',
    required: true,
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
    options: [
      {
        value: '1',
        label: _('1M'),
      },
    ],
  }, {
    id: 'time',
    label: _('Count'),
    type: 'text',
    form: 'recharge',
    disabled: true,
    required: true,
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
    validator: validator({
      rules: 'num[0,9999]',
    }),
  }, {
    id: 'money',
    label: _('Price'),
    form: 'recharge',
    disabled: true,
    type: 'text',
    required: true,
    help: _('$'),
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
  }, {
    id: 'description',
    label: _('Description'),
    form: 'recharge',
    disabled: true,
    width: '120px',
    type: 'textarea',
    required: true,
    showPrecondition(data) {
      return data.get('name') !== undefined;
    },
  },
]);

const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  validateAll: PropTypes.func,
  onListAction: PropTypes.func,
  updateCurEditListItem: PropTypes.func,
  reportValidError: PropTypes.func,
  changeScreenActionQuery: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBaseShow: true,
      isAdvancedShow: false,
    };

    utils.binds(this, [
      'renderCustomModal',
      'onAction',
      'onSave',
      'toggleBox',
      'getDefaultEditData',
      'onBeforeSave',
    ]);
    this.state = {
      $$cardDataList: fromJS([]),
    };
  }

  componentWillMount() {
    getCardCategoryName()
      .then((data) => {
        this.setState({
          categoryTypeOptions: fromJS(data.options),
        });
      });
    getCardInformation()
      .then(($$data) => {
        this.setState({
          $$cardDataList: $$data,
        });
      });
    // this.getDefaultEditData();
  }
  // onBeforeSave() {
  //   const { store } = this.props;
  //   const myScreenId = store.get('curScreenId');
  //   const $$myScreenStore = store.get(myScreenId);
  //   const $$curData = $$myScreenStore.get('curListItem');
  // }
  onSave(formId) {
    if (this.props.validateAll) {
      this.props.validateAll(formId)
        .then((errMsg) => {
          if (errMsg.isEmpty()) {
            this.props.onListAction({
              needMerge: true,
            });
          }
        });
    }
  }
  // getDefaultEditData() {
  //   const myDefaultEditData = {};
  //   baseSetting.forEach(
  //     ($$item, index) => {
  //       const curId = $$item.get('id');
  //       const defaultValue = $$item.get('defaultValue') || '';

  //       myDefaultEditData[curId] = defaultValue;

  //       return index;
  //     },
  //   );
  //   advancedSetting.forEach(
  //     ($$item, index) => {
  //       const curId = $$item.get('id');
  //       const defaultValue = $$item.get('defaultValue') || '';
  //       myDefaultEditData[curId] = defaultValue;
  //       return index;
  //     },
  //   );

  //   this.defaultEditData = myDefaultEditData;
  // }
  toggleBox(moduleName) {
    this.setState({
      [moduleName]: !this.state[moduleName],
    });
  }
  renderCustomModal() {
    const { store, app, route } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    const $$curData = $$myScreenStore.get('curListItem');
    const actionType = $$myScreenStore.getIn(['actionQuery', 'action']);
    const isRecharge = store.getIn([route.id, 'actionQuery', 'action']) === 'recharge';
    const $$curRechargeOptions = rechargeOptions.setIn([2, 'options'], this.state.categoryTypeOptions);
    const $$cardDataList = this.state.$$cardDataList;
    const $$cardDataItem = $$cardDataList.find($$item => $$item.get('id') === $$curData.get('name'));
    let $$rechargeDetailData = $$curData;
    let $$mybaseSetting = baseSetting;

    if ($$cardDataItem) {
      $$rechargeDetailData = $$curData.merge($$cardDataItem.delete('name'));
    }

    if (actionType !== 'add' && actionType !== 'edit' && !isRecharge) {
      return null;
    }
    if (actionType === 'edit') {
      $$mybaseSetting = $$mybaseSetting.map(
        ($$item) => {
          let $$ret = $$item;
          if ($$ret.get('notEditable')) {
            $$ret = $$ret.set('disabled', true);
          }
          return $$ret;
        },
      );
    }

    if (isRecharge) {
      return (
        <FormContainer
          id="recharge"
          options={$$curRechargeOptions}
          data={$$rechargeDetailData}
          onChangeData={this.props.updateCurEditListItem}
          onSave={() => this.onSave('recharge')}
          invalidMsg={app.get('invalid')}
          validateAt={app.get('validateAt')}
          isSaving={app.get('saving')}
          savedText="success"
          hasSaveButton
        />
      );
    }
    return (
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
                id="baseSetting"
                className="o-form--compassed"
                options={$$mybaseSetting}
                data={$$curData}
                onChangeData={this.props.updateCurEditListItem}
                onSave={() => this.onSave('baseSetting')}
                invalidMsg={app.get('invalid')}
                validateAt={app.get('validateAt')}
                onValidError={this.props.reportValidError}
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
                id="advancedSetting"
                options={advancedSetting}
                className="o-form--compassed"
                data={$$curData}
                onChangeData={this.props.updateCurEditListItem}
                onSave={() => this.onSave('advancedSetting')}
                invalidMsg={app.get('invalid')}
                validateAt={app.get('validateAt')}
                onValidError={this.props.reportValidError}
                isSaving={app.get('saving')}
                hasSaveButton
              />
            </div>
          ) : null
        }
      </div>
    );
  }
  render() {
    const curListOptions = listOptions
          .setIn([-1, 'transform'], (val, $$data) => (
            <span>
              <Button
                text={_('Recharge')}
                key="rechargeActionButton"
                icon="vcard"
                onClick={() => {
                  this.props.changeScreenActionQuery({
                    action: 'recharge',
                    myTitle: _('Recharge'),
                  });
                  this.props.updateCurEditListItem({
                    id: $$data.get('id'),
                    loginName: $$data.get('loginName'),
                    nickname: $$data.get('name'),
                  });
                }}
              />
            </span>
          ),
          );
    return (
      <AppScreen
        {...this.props}
        listOptions={curListOptions}
        modalChildren={this.renderCustomModal()}
        selectable
        actionable
      />
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
    screenActions,
    propertiesActions,
  ), dispatch);
}


// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(View);
