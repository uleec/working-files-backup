import React from 'react';
import utils from 'shared/utils';
import { bindActionCreators } from 'redux';
import { fromJS, Map } from 'immutable';
import { connect } from 'react-redux';
import validator from 'shared/validator';
import { FormGroup } from 'shared/components/Form';
import Table from 'shared/components/Table';
import Modal from 'shared/components/Modal';
import Button from 'shared/components/Button/Button';
import { actions as appActions } from 'shared/containers/app';
import PureComponent from 'shared/components/Base/PureComponent';
import * as actions from './actions';
import reducer from './reducer';

const msg = {
  delete: __('Delete'),
  edit: __('Edit'),
  look: __('View'),
  add: __('Add'),
  remarks: __('Remarks'),
  groupname: __('Group Name'),
  action: __('Actions'),
  devicesNum: __('Devices Number'),
};

const validOptions = Map({
  groupname: validator({
    rules: 'required',
  }),
  remarks: validator({
    rules: 'required',
  }),
});

// 原生的 react 页面
export class GroupSettings extends PureComponent {
  constructor(props) {
    super(props);

    utils.binds(this, [
      'getEditVal',
      'onSelectDevice',
      'onRowSelect',
      'onAddGroup',
      'onEditGroup',
      'onDeleteGroup',
      'onChangeGroupSettings',
      'onSaveDeviceGroup',
      'createLookFunc',
      'onCloseEditDialog',

      'getGroupTableOptions',
      'getDevicesTableOptions',
      'renderEditTable',
    ]);
  }

  componentWillMount() {
    this.props.fetchDeviceGroups();
    this.props.fetchGroupDevices();
  }

  componentDidUpdate(prevProps) {
    let modalStatus = this.props.app.getIn(['modal', 'status']);

    if (prevProps.app.get('refreshAt') !== this.props.app.get('refreshAt')) {
      this.props.fetchDeviceGroups();
      this.props.fetchGroupDevices();
    }
  }

  componentWillUnmount() {
    this.props.resetVaildateMsg();
  }

  getEditVal(key) {
    let ret = '';

    if (this.props.edit) {
      ret = this.props.edit.get(key);
    }
    return ret;
  }

  onSelectDevice(e) {
    const elem = e.target;
    const mac = elem.value;

    if (elem.checked) {
      this.props.selectDevice(mac);
    } else {
      this.props.selectDevice(mac, true);
    }
  }

  onAddGroup() {
    this.props.addDeviceGroup();
  }

  onEditGroup(groupname) {
    this.props.editDeviceGroup(groupname);
  }

  onDeleteGroup(groupname) {
    let comfri_text = __('Are you sure delete group: %s?', groupname);

    this.props.createModal({
      id: 'groupSettings',
      groupname,
      role: 'confirm',
      text: comfri_text,
      apply: function () {
        this.props.deleteDeviceGroup(groupname);
      }.bind(this),
    });
  }

  onRowSelect(index) {
    //  index {index: 0, selected: true, unselectableList: Array(0)};
    this.props.selectRow(index);
  }
  onChangeGroupSettings(name) {
    return function (data) {
      let editObj = {};

      editObj[name] = data.value;
      this.props.changeEditGroup(editObj);
    }.bind(this);
  }

  onSaveDeviceGroup() {
    if (this.props.actionType === 'look') {
      this.onCloseEditDialog();
      return;
    }
    this.props.validateAll()
      .then((invalid) => {
        let editData = this.props.edit.toJS();
        let groupList = this.props.data.get('list');
        let hasSameName = false;

        if (invalid.isEmpty()) {
          // 验证组名是否与其它组相同
          if (editData.groupname !== editData.orignName) {
            hasSameName = !!groupList.find(function (group) {
              return group.get('groupname').trim() === editData.groupname.trim();
            });
          }

          if (hasSameName) {
            this.props.createModal({
              id: 'groupSettings',
              role: 'alert',
              text: __("Group name '%s' is already in use", editData.groupname),
            });
          } else {
            this.props.saveDeviceGroup();
          }
        }
      });
  }

  createLookFunc(groupname) {
    return () => {
      this.props.lookGroupDevices(groupname);
    };
  }

  onCloseEditDialog() {
    this.props.resetVaildateMsg();
    this.props.removeEditDeviceGroup();
  }

  getGroupTableOptions() {
    let ret = fromJS([
      {
        id: 'groupname',
        text: msg.groupname,
        render (val) {
          if (val === 'Default') {
            val = __('Ungrouped Devices');
          }
          return val;
        },
      }, {
        id: 'num',
        text: msg.devicesNum,
    }, {
      id: 'remark',
      text: msg.remarks,
    }, {
      id: 'op',
      text: msg.action,
      width: 240,
      render: function (val, item) {
        if (item.get('groupname') === 'Default') {
          return (<Button
            icon="eye"
            size="sm"
            text={msg.look}
            onClick={this.createLookFunc('Default')}
          />);
        }

        return (
          <div className="action-btns">
            <Button
              icon="eye"
              size="sm"
              text={msg.look}
              onClick={this.createLookFunc(item.get('groupname'))}
            />
            <Button
              onClick={this.onEditGroup.bind(this, item.get('groupname'))}
              icon="edit"
              text={msg.edit}
              size="sm"
            />

            <Button
              id={item.get('id')}
              icon="trash"
              onClick={this.onDeleteGroup.bind(this, item.get('groupname'))}
              text={msg.delete}
              size="sm"
            />

          </div>
        );
      }.bind(this),
    }]);
    const noControl = this.props.app.get('noControl');

    if (noControl) {
      ret = ret.delete(-1);
    }

    return ret;
  }

  getDevicesTableOptions() {
    let ret = fromJS([{
      id: 'devicename',
      text: __('Name'),
    }, {
      id: 'mac',
      text: __('MAC Address'),
    }, {
        id: 'ip',
        text: __('IP Address'),
      }, {
        id: 'status',
        text: __('Status'),
        filter: 'translate',
      }, {
        id: 'groupname',
        text: __('Current Group'),
        render(val) {
          if (val === 'Default') {
            val = __('Ungrouped Devices');
          }
          return val;
        },
      },
      // {
      //   id: 'op',
      //   text: __('Select'),
      //   width: 50,
      //   render: (val, $$item) => {
      //     const selectedDevices = this.props.edit.get('devices');
      //     const deviceMac = $$item.get('mac');

      //     return (
      //       <div className="action-btns">
      //         <input
      //           type="checkbox"
      //           value={deviceMac}
      //           onChange={this.onSelectDevice}
      //           checked={selectedDevices.indexOf(deviceMac) !== -1}
      //         />
      //       </div>
      //     );
      //   },
      // }
    ]);
    const noControl = this.props.app.get('noControl');

    if (noControl) {
      ret = ret.delete(-1);
    }
    return ret;
  }
  renderEditTable(isLook) {
    const devicesTableOptions = this.getDevicesTableOptions();
    const { groupname, remarks } = this.props.validateOption;

    return (
      <div>
        {
          isLook ? (
            <Table
              options={fromJS(devicesTableOptions).delete(-1)}
              list={this.props.seeDevices}
            />
          ) : (
            <div>
              <FormGroup
                label={msg.groupname}
                required
                value={this.getEditVal('groupname')}
                maxLength="24"
                id="groupname"
                onChange={this.onChangeGroupSettings('groupname')}
                {...groupname}
              />
              <FormGroup
                label={msg.remarks}
                required
                maxLength="31"
                value={this.getEditVal('remark')}
                id="remark"
                onChange={this.onChangeGroupSettings('remark')}
                {...remarks}
              />
              <Table
                options={fromJS(devicesTableOptions)}
                list={this.props.devices.get('list')}
                page={this.props.page}
                onRowSelect={this.onRowSelect}
                selectable
              />
            </div>
          )
        }
      </div>
    );
  }
  render() {
    const groupTableOptions = this.getGroupTableOptions();
    const isLook = this.props.actionType === 'look';
    const noControl = this.props.app.get('noControl');
    let modalTitle = this.getEditVal('orignName');

    if (this.props.actionType === 'add') {
      modalTitle = msg.add;
    } else if (this.props.actionType === 'edit') {
      modalTitle = msg.edit + ' ' + modalTitle;
    } else if (this.props.actionType === 'look') {
      if (this.props.edit.get('groupname') === 'Default') {
        modalTitle = __('Ungrouped Devices');
      } else {
        modalTitle = this.props.edit.get('groupname');
      }
    }

    return (
      <div>
        <h3>{__('Group List')}</h3>
        <div style={{ padding: '8px 0', overflow: 'auto' }}>
          {
            noControl ? null : (
              <Button
                icon="plus"
                className="fl"
                theme="primary"
                onClick={this.onAddGroup}
                text={msg.add}
              />
            )
          }
        </div>
        <Table
          loading={this.props.fetching}
          options={fromJS(groupTableOptions)}
          list={this.props.data.get('list')}
        />

        <Modal
          isShow={this.props.edit ? true : false}
          title={modalTitle}
          onClose={this.onCloseEditDialog}
          onOk={this.onSaveDeviceGroup}
          cancelButton={!isLook}
          okButton={!isLook}
          draggable
        >
          {
            this.props.edit ? this.renderEditTable(isLook) : null
          }
        </Modal>
      </div>
    );
  }
}

// React.PropTypes.instanceOf(Immutable.List).isRequired
function mapStateToProps(state) {
  const myState = state.groupSettings;

  return {
    fetching: myState.get('fetching'),
    data: myState.get('data'),
    actionType: myState.get('actionType'),
    edit: myState.get('edit'),
    devices: myState.get('devices'),
    seeDevices: myState.get('seeDevices'),
    app: state.app,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    actions,
  ), dispatch);
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions),
)(GroupSettings);

export const settings = reducer;

