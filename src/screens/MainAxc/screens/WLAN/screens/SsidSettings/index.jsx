import React from 'react'; import PropTypes from 'prop-types';
import utils, { immutableUtils } from 'shared/utils';
import validator from 'shared/validator';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { SaveButton, Button } from 'shared/components/Button';
import Table from 'shared/components/Table';

import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';
import { actions as appActions } from 'shared/containers/app';
import * as productActions from '../../../../reducer';

const msg = {
  upSpeed: __('Up Speed'),
  downSpeed: __('Down Speed'),
  selectGroup: __('Select Group'),
};
const loadBalanceTypeArr = [
  {
    value: '0',
    label: __('Disable'),
  }, {
    value: '1',
    label: __('Users'),
  }, {
    value: '2',
    label: __('SSID'),
  },
];

const validOptions = Map({
  password: validator({
    rules: 'remarkTxt:["\'\\\\"]|len:[8, 256]',
  }),
  vlanid: validator({
    rules: 'num:[2, 4095]',
  }),
  ssid: validator({
    rules: 'remarkTxt:["\'\\\\"]|len:[1, 32]',
  }),
  upstream: validator({
    rules: 'num:[0, 102400, 0]',
  }),
  downstream: validator({
    rules: 'num:[0, 102400, 0]',
  }),
  maxUser: validator({
    rules: 'num:[0, 64]',
  }),
});
const storeForwardOption = [
  {
    value: 'local',
    label: __('Local Forward'),
  },
  //  {
  //   value: 'centralized-802.3',
  //   label: __('Centralized Forward-%s', '802.3'),
  // }, {
  //   value: 'centralized-802.11',
  //   label: __('Centralized Forward-%s', '802.11'),
  // },
];
const checkboxOptions = [
  {
    value: '1',
    label: __('On'),
    render() {
      return (
        <span
          style={{
            color: 'green',
          }}
        >
          {__('On')}
        </span>
      );
    },
  }, {
    value: '0',
    label: __('Off'),
    render() {
      return (
        <span
          style={{
            color: 'red',
          }}
        >
          {__('Off')}
        </span>
      );
    },
  },
];
const $$accessTypeSeletOptions = fromJS([
  {
    value: 'portal',
    label: __('Portal'),
  },
  {
    value: '8021x-access',
    label: __('802.1x'),
    disabled: true,
  },
  {
    value: 'lan-access',
    label: __('LAN'),
    disabled: true,
  }, {
    value: 'ppp-access',
    label: __('PPP'),
    disabled: true,
  }, {
    value: 'mac-access',
    label: __('MAC'),
    disabled: true,
  },
]);
const flowRateFilter = utils.filter('flowRate:["KB"]');

const defaultQuery = {};
const noPortal = window.guiConfig.noPortal;
const noAAA = window.guiConfig.noAAA;

let encryptionOptions = fromJS([
  {
    value: 'none',
    label: __('NONE'),
  }, {
    value: 'psk-mixed',
    label: __('WPA2-PSK'),
  }, {
    value: '802.1x',
    label: '802.1x',
  },
]);
let authenticationTypeOptions = fromJS([
  {
    value: 'none+none',
    label: __('NONE'),
  },
  // {
  //   value: 'none+portal',
  //   label: __(' Portal'),
  // },
  {
    value: 'psk-mixed+none',
    label: __('WPA2-PSK'),
  },
  // {
  //   value: 'psk-mixed+portal',
  //   label: __('WPA2-PSK + Portal'),
  // },
  {
    value: '802.1x',
    label: '802.1x',
  },
]);
let noAuthTableCol = false;
let noAAAFormgroup = false;
let aaaDefaultValue = 'local';

function getPortalTemplateName() {
  return utils.fetch('goform/network/portal/server', {
    size: 9999,
    page: 1,
  })
    .then(json => (
      {
        options: json.data.list.map(
          item => ({
            value: item.template_name,
            label: item.template_name,
          }),
        ),
      }
    ));
}

function getWebTemplateName() {
  return utils.fetch('goform/portal/access/web', {
    size: 9999,
    page: 1,
  })
    .then(json => (
      {
        options: json.data.list.map(
          item => ({
            value: item.id,
            label: __(item.name),
          }),
        ),
      }
    ));
}

function getSSIDWebTemplate() {
  return utils.fetch('goform/portal/access/ssidmanagement', {
    size: 9999,
    page: 1,
  }).then((json) => {
    if (json.state && json.state.code === 2000) {
      return fromJS(json.data.list);
    }
    return fromJS([]);
  });
}

// 处理无 Portal 模块时的配置
if (noPortal) {
  // 删除 Portal 相关选项
  authenticationTypeOptions = authenticationTypeOptions.delete(1).delete(-2);
  noAuthTableCol = true;
  aaaDefaultValue = '';

  defaultQuery.accessControl = 'none';
}

//  处理没有 AAA 模板
if (noAAA) {
  // 删除 802.1x 相关配置
  encryptionOptions = encryptionOptions.delete(-1);
  authenticationTypeOptions = authenticationTypeOptions.delete(-1);

  noAAAFormgroup = true;
}

// 列表配置项
const listOptions = fromJS([
  {
    id: 'ssid',
    notEditable: true,
    text: __('SSID'),
    maxLength: '31',
    formProps: {
      type: 'text',
      required: true,
      notEditable: true,
      validator: validator({
        rules: 'utf8Len:[1, 31]|remarkTxt:["\'\\\\"]',
      }),
    },
  }, {
    id: 'remark',
    text: __('Description'),
    formProps: {
      type: 'text',
      maxLength: 255,
      validator: validator({
        rules: 'utf8Len:[1, 255]',
      }),
    },
    noTable: true,
  },
  {
    id: 'storeForwardPattern',
    options: storeForwardOption,
    noTable: true,
    text: __('Forwarding Mode'),
    defaultValue: 'local',
    formProps: {
      type: 'select',
      noForm: true,
    },
  },
  {
    id: 'vlanId',
    text: __('VLAN ID'),
    defaultValue: '1',
    formProps: {
      type: 'number',
      min: '1',
      max: '4094',
      required: true,
    },
  },
  {
    id: 'upstream/downstream',
    text: __('Data'),
    render(val, item) {
      const upRate = flowRateFilter.transform(item.get('upstream'));
      const downRate = flowRateFilter.transform(item.get('downstream'));

      return `${upRate}↑ / ${downRate}↓`;
    },
    noForm: true,
  },
  {
    id: 'encryption',
    text: __('Encryption'),
    defaultValue: 'psk-mixed',
    options: encryptionOptions,
    noTable: true,
    noForm: true,
    formProps: {
      type: 'switch',
    },
  },
  {
    id: 'authenticationType',
    text: __('Authentication Type'),
    defaultValue: 'none',
    options: authenticationTypeOptions,
    formProps: {
      type: 'select',
      initValue: ($$data) => {
        const encryption = $$data.get('encryption');
        const accessControl = $$data.get('accessControl');
        let ret = '802.1x';

        if (encryption !== '802.1x') {
          ret = encryption;

          if (accessControl) {
            ret = `${ret}+${accessControl}`;
          }
        }

        return ret;
      },
      onChange: (data) => {
        const newData = data;
        const encryption = newData.value.split('+')[0];
        const accessControl = newData.value.split('+')[1];

        newData.mergeData = {
          encryption,
        };

        if (accessControl) {
          newData.mergeData.accessControl = accessControl;
        }

        if (accessControl === 'portal') {
          newData.mergeData.portalTemplate = 'local';
        }

        return newData;
      },
    },
    render: (val, $$data) => {
      const encryption = $$data.get('encryption');
      const accessControl = $$data.get('accessControl');
      let ret = '802.1x';

      if (encryption !== '802.1x') {
        ret = encryption;

        if (accessControl) {
          ret = `${ret}+${accessControl}`;
        }
      }

      return ret;
    },
  },
  {
    id: 'password',
    text: __('Password'),
    defaultValue: '',
    noTable: true,
    formProps: {
      type: 'password',
      required: true,
      maxLength: '63',
      validator: validator({
        rules: 'remarkTxt:["\'\\\\"]|utf8Len:[8, 63]',
      }),
      visible($$data) {
        const curRepaet = $$data.get('encryption');

        return curRepaet === 'psk-mixed';
      },
    },
  },
  {
    id: 'accessControl',
    text: __('Access Control'),
    defaultValue: 'none',
    noForm: true,
    noTable: true,
    options: [
      {
        value: 'none',
        label: __('None'),
      },
      {
        value: 'portal',
        label: __('Portal'),
      },
    ],
    formProps: {
      type: 'switch',
      visible($$data) {
        const curRepaet = $$data.get('encryption');

        return curRepaet !== '802.1x';
      },
    },
  },
  {
    id: 'portalTemplate',
    text: __('Portal Template'),
    defaultValue: 'local',
    noTable: true,
    noForm: true,
    formProps: {
      type: 'select',
      required: true,
      visible($$data) {
        const accessControl = $$data.get('accessControl');
        const encryption = $$data.get('encryption');
        return accessControl === 'portal' && encryption !== '802.1x';
      },
    },
  },
  {
    id: 'auth',
    text: __('Portal Template'),
    noTable: noAuthTableCol,
    formProps: {
      type: 'select',
      required: true,
      visible($$data) {
        const portalTemplate = $$data.get('portalTemplate');
        const accessControl = $$data.get('accessControl');
        const encryption = $$data.get('encryption');
        return portalTemplate === 'local' && accessControl === 'portal' && encryption !== '802.1x';
      },
    },
  },
  {
    id: 'mandatorydomain',
    text: __('User Access Policies'),
    defaultValue: aaaDefaultValue,
    noTable: true,
    noForm: noAAAFormgroup,
    formProps: {
      type: 'select',
      visible($$data) {
        const encryption = $$data.get('encryption');
        return encryption === '802.1x';
      },
    },
  },
  {
    id: 'maxBssUsers',
    text: __('Max Clients'),
    defaultValue: 64,
    formProps: {
      type: 'number',
      min: 1,
      max: 128,
    },
  },
  {
    id: 'loadBalanceType',
    text: __('Data Control'),
    noTable: true,
    defaultValue: '0',
    options: loadBalanceTypeArr,
    formProps: {
      type: 'switch',
      noForm: true,
    },
  },
  {
    id: 'upstream',
    defaultValue: '64',
    text: msg.upSpeed,
    noTable: true,
    formProps: {
      type: 'number',
      min: 1,
      max: 102400,
      required: true,
      visible($$data) {
        const curRepaet = $$data.get('loadBalanceType');

        return curRepaet !== '0';
      },
      help: 'KB/S',
    },
  },
  {
    id: 'downstream',
    defaultValue: '256',
    text: msg.downSpeed,
    noTable: true,
    formProps: {
      type: 'number',
      min: 1,
      max: 102400,
      required: true,
      visible($$data) {
        const curRepaet = $$data.get('loadBalanceType');

        return curRepaet !== '0';
      },
      help: 'KB/S',
    },
  },
  {
    id: 'hiddenSsid',
    text: __('Hide SSID'),
    options: [
      {
        value: '1',
        label: __('YES'),
        render() {
          return (
            <span
              style={{
                color: 'red',
              }}
            >
              {__('YES')}
            </span>
          );
        },
      }, {
        value: '0',
        label: __('NO'),
        render() {
          return (
            <span
              style={{
                color: 'green',
              }}
            >
              {__('NO')}
            </span>
          );
        },
      },
    ],
    defaultValue: '0',
    formProps: {
      type: 'checkbox',
      value: '1',
    },
  },
  {
    id: 'ssidisolate',
    text: __('Wireless Client Isolation'),
    defaultValue: '1',
    options: checkboxOptions,
    formProps: {
      type: 'checkbox',
      value: '1',
    },
  },
  {
    id: 'greenap',
    text: __('Green AP Mode'),
    defaultValue: '1',
    options: checkboxOptions,
    formProps: {
      type: 'checkbox',
      value: '1',
    },
  },
  {
    id: 'enabled',
    text: __('Status'),
    // options: checkboxOptions,
    type: 'switch',
    actionName: 'active',
    defaultValue: '1',
    noForm: true,
    formProps: {
      type: 'checkbox',
      value: '1',
    },
  },
]);

const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  group: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  groupid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  changeScreenActionQuery: PropTypes.func,
  updateCurListItem: PropTypes.func,
  fetch: PropTypes.func,
  save: PropTypes.func,
  receiveScreenData: PropTypes.func,
  createModal: PropTypes.func,
  onListAction: PropTypes.func,
};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);

    this.getCurrData = this.getCurrData.bind(this);
    this.onUpdateSettings = this.onUpdateSettings.bind(this);

    utils.binds(this, [
      'onSave',
      'fetchCopyGroupSsids',
      'renderActionBar',
      'onOpenCopySsidModal',
      'onSelectCopyFromGroup',
      'renderUpdateSsid',
      'renderCopySsid',
      'onSelectCopySsid',
      'fetchMandatoryDomainList',
      'onBeforeSave',
      'onBeforeSync',
    ]);
    this.state = {
      updateListOptions: false,
      WebTemplateNameOptions: fromJS([]),
      portalServerTemplateNameOptions: fromJS([]),
      ssidWebTemplateInformation: fromJS([]),
    };
    // 对特定版本处理
    this.listOptions = listOptions;
  }
  componentWillMount() {
    if (!noPortal) {
      getWebTemplateName()
        .then((data) => {
          this.setState({
            WebTemplateNameOptions: fromJS(data.options),
          });
        });
      getPortalTemplateName()
        .then((data) => {
          this.setState({
            portalServerTemplateNameOptions: fromJS(data.options),
          });
        });
      getSSIDWebTemplate()
        .then(($$data) => {
          this.setState({
            ssidWebTemplateInformation: $$data,
          });
        });
    }
  }

  componentDidMount() {
    this.props.changeScreenActionQuery({
      groupid: this.props.groupid,
    });

    this.fetchMandatoryDomainList();
  }
  onSave(type) {
    const { store } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    const $$copyGroupSsids = $$myScreenStore.getIn(['data', 'copyGroupSsids']);

    if (type === 'copy') {
      let $$copySelectedList = $$myScreenStore.getIn(['actionQuery', 'copySelectedList']);

      $$copySelectedList = $$copySelectedList.map(
        index => $$copyGroupSsids.getIn(['list', index, 'ssid']),
      );

      // 没有选择要拷贝的 Ssids
      if ($$copySelectedList.size < 1) {
        this.props.createModal({
          type: 'alert',
          text: __('Please select ssid'),
        });
      } else {
        this.props.changeScreenActionQuery({
          copySelectedList: $$copySelectedList.toJS(),
        });
        this.props.onListAction().then(() => {
          this.props.changeScreenActionQuery({
            copySelectedList: [],
          });
        });
      }
    }
  }
  onUpdateSettings(name) {
    return (item) => {
      const data = {};

      data[name] = item.value;
      this.props.updateCurListItem(data);
    };
  }
  onOpenCopySsidModal() {
    const { store } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    const copyFromGroupId = $$myScreenStore.getIn(['actionQuery', 'copyFromGroupId']);

    this.props.changeScreenActionQuery({
      action: 'copy',
      myTitle: __('Copy Form Other Group'),
      copySelectedList: fromJS([]),
    });
    this.fetchCopyGroupSsids(copyFromGroupId);
  }

  onSelectCopyFromGroup(groupId, e) {
    e.preventDefault();
    this.props.changeScreenActionQuery({
      copyFromGroupId: groupId,
      copySelectedList: fromJS([]),
    });
    this.fetchCopyGroupSsids(groupId);
  }
  onSelectCopySsid(data) {
    const { store } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    let $$copySelectedList = $$myScreenStore.getIn(['actionQuery', 'copySelectedList']);
    let $$copyGroupSsid = $$myScreenStore.getIn(['data', 'copyGroupSsids']);

    $$copyGroupSsid = $$copyGroupSsid.update('list',
      ($$list) => {
        const ret = immutableUtils.selectList(
          $$list,
          data,
          $$copySelectedList,
        );
        $$copySelectedList = ret.selectedList;
        return ret.$$list;
      },
    );

    this.props.receiveScreenData({
      copyGroupSsids: $$copyGroupSsid,
    }, this.props.route.id);
    this.props.changeScreenActionQuery({
      copySelectedList: $$copySelectedList,
    });
  }
  onBeforeSync($$actionQuery, $$curListItem) {
    if ($$actionQuery.get('action') === 'add' && $$curListItem.get('portalTemplate') === 'local' && $$curListItem.get('Authentication') !== undefined) {
      this.props.save('goform/system/ap/version', $$actionQuery.merge($$curListItem).toJS())
        .then((json) => {
          const state = json && json.state;
          if (state.code === 2000) {
            this.props.save('goform/portal/access/ssidmanagement', {
              name: `${$$curListItem.get('ssid')}${$$curListItem.get('Authentication')}`,
              ssid: $$curListItem.get('ssid'),
              web: $$curListItem.get('Authentication'),
            }).then(
              () => {
                if (json && json.state && json.state.code === 2000) {
                  this.props.receiveScreenData();
                }
              },
            );
          }
        });
    }
  }
  getCurrData(name) {
    return this.props.store.getIn([this.props.route.id, 'curListItem', name]);
  }

  fetchCopyGroupSsids(groupid) {
    const fetchUrl = this.props.route.fetchUrl || this.props.route.formUrl;
    const queryData = {
      groupid,
    };

    if (groupid === -100) {
      queryData.filterGroupid = this.props.groupid;
    }

    this.props.fetch(fetchUrl, queryData)
      .then(
        (json) => {
          if (json && json.state && json.state.code === 2000) {
            this.props.receiveScreenData({
              copyGroupSsids: json.data,
            }, this.props.route.id);
          }
        },
      );
  }
  fetchMandatoryDomainList() {
    this.props.fetch('goform/portal/Aaa', {
      page: 1,
      size: 500,
    })
      .then((json) => {
        let options = [];

        if (json && json.data && json.data.list) {
          options = json.data.list
            .filter(
              item => item,
            ).map(
              (item) => {
                const $$curAccessTypeItem = $$accessTypeSeletOptions.find(
                  $$item => $$item.get('value') === item.auth_accesstype,
                );
                let curAccessTypeLabel = '';

                if ($$curAccessTypeItem) {
                  curAccessTypeLabel = $$curAccessTypeItem.get('label');
                }

                return {
                  value: item.domain_name,
                  label: `${item.domain_name}(${curAccessTypeLabel})`,
                  type: item.auth_accesstype,
                };
              },
            );
        }

        if (options) {
          options.unshift({
            value: '',
            label: __('None'),
          });
        }

        this.setState({
          updateListOptions: !this.state.updateListOptions,
        });
        this.listOptions = this.listOptions.map(
          ($$item) => {
            let $$retItem = $$item;

            if ($$retItem.get('id') === 'mandatorydomain') {
              $$retItem = $$retItem.setIn(['formProps', 'options'],
                ($$data) => {
                  let $$retOptions = fromJS(options);

                  if ($$data.get('encryption') === '802.1x') {
                    $$retOptions = $$retOptions.filter(
                      $$optionItem => $$optionItem.get('type') === '8021x-access',
                    );
                  } else {
                    $$retOptions = $$retOptions.filter(
                      $$optionItem => $$optionItem.get('type') !== '8021x-access',
                    );
                  }

                  return $$retOptions.toJS();
                },
              );
            }

            return $$retItem;
          },
        );
      });
  }

  renderActionBar() {
    return (
      <Button
        text={__('Link From Other Group')}
        key="cpoyActionButton"
        icon="link"
        theme="primary"
        onClick={() => this.onOpenCopySsidModal()}
      />
    );
  }

  renderCopySsid() {
    const { store, app, route } = this.props;
    const myScreenId = store.get('curScreenId');
    const $$myScreenStore = store.get(myScreenId);
    const $$group = this.props.group;
    const selectGroupId = $$group.getIn(['selected', 'id']);
    const copyFromGroupId = $$myScreenStore.getIn(['actionQuery', 'copyFromGroupId']);
    const actionQuery = store.getIn([route.id, 'actionQuery']) || Map({});

    const ssidTableOptions = [
      {
        id: 'ssid',
        text: __('SSID'),
      }, {
        id: 'hiddenSsid',
        text: __('Hide SSID'),
        options: [
          {
            value: '1',
            label: __('YES'),
            render() {
              return (
                <span
                  style={{
                    color: 'red',
                  }}
                >
                  {__('YES')}
                </span>
              );
            },
          }, {
            value: '0',
            label: __('NO'),
            render() {
              return (
                <span
                  style={{
                    color: 'green',
                  }}
                >
                  {__('NO')}
                </span>
              );
            },
          },
        ],
        defaultValue: '0',
      }, {
        id: 'storeForwardPattern',
        options: storeForwardOption,
        text: __('Forward Pattern'),
        defaultValue: 'local',
      }, {
        id: 'encryption',
        text: __('Encryption'),
        defaultValue: 'psk-mixed',
      },
    ];

    if (actionQuery.get('action') !== 'copy') {
      return null;
    }

    return (
      <div className="row">
        <div className="o-list cols col-4">
          <h3 className="o-list__header">{__('Group List')}</h3>
          <ul className="m-menu m-menu--open">
            {
              $$group.getIn(['list']).map((item) => {
                const curId = item.get('id');
                let classNames = 'm-menu__link';

                // 不能选择自己组
                if (curId === selectGroupId) {
                  return null;
                }

                if (curId === copyFromGroupId) {
                  classNames = `${classNames} active`;
                }

                return (
                  <li key={curId}>
                    <a
                      className={classNames}
                      onClick={
                        e => this.onSelectCopyFromGroup(curId, e)
                      }
                    >
                      {item.get('groupname')}
                    </a>
                  </li>
                );
              })
            }
          </ul>

        </div>
        <div className="o-list cols col-8">
          <h3 className="o-list__header">{__('Group SSID List')}</h3>
          <Table
            options={ssidTableOptions}
            list={$$myScreenStore.getIn(['data', 'copyGroupSsids', 'list'])}
            psge={$$myScreenStore.getIn(['data', 'copyGroupSsids', 'page'])}
            onRowSelect={this.onSelectCopySsid}
            selectable
          />
          <div className="o-list__footer">
            <SaveButton
              type="button"
              text={__('Apply')}
              savingText={__('Applying')}
              savedText={__('Applied')}
              className="fr"
              loading={app.get('saving')}
              onClick={() => this.onSave('copy')}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { store, route } = this.props;
    const actionQuery = store.getIn([route.id, 'actionQuery']) || Map({});
    const notEditListItem = actionQuery.get('action') === 'copy';
    const curListOptions = this.listOptions.map(($$item) => {
      let $$retItem = $$item;

      if ($$retItem.get('id') === 'portalTemplate') {
        $$retItem = $$retItem.set('options', this.state.portalServerTemplateNameOptions);
      } else if ($$retItem.get('id') === 'auth') {
        $$retItem = $$retItem.set('options', this.state.WebTemplateNameOptions);
      }
      return $$retItem;
    });

    return (
      <AppScreen
        {...this.props}
        listOptions={curListOptions}
        listKey="allKeys"
        maxListSize="16"
        actionBarChildren={this.renderActionBar()}
        initOption={{
          actionQuery: {
            copyFromGroupId: -100,
          },
          query: defaultQuery,
        }}
        modalSize={notEditListItem ? 'lg' : 'md'}
        modalChildren={this.renderCopySsid()}
        actionable
        selectable
      />
    );
  }
}

View.propTypes = propTypes;
View.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    group: state.product.get('group'),
    groupid: state.product.getIn(['group', 'selected', 'id']),
    store: state.screens,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    screenActions,
    productActions,
  ), dispatch);
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions),
)(View);
