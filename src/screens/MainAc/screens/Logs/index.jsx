import React from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fromJS } from 'immutable';

// components
import { PureComponent, Table, Button, Switchs } from 'shared/components';
import { actions as appActions } from 'shared/containers/app';

// custom
import * as actions from './actions';
import reducer from './reducer';

const logsTableOptions = fromJS([
  {
    id: 'time',
    text: __('Time'),
    width: 200,
  }, {
    id: 'type',
    text: __('Type'),
    width: 180,
    render(val) {
      const typeMap = {
        ap: __('DEVICES'),
        client: __('CLIENTS'),
        group: __('Groups'),
        wireless: __('Wireless'),
        portal: __('Portal Settings'),
        guest: __('Guest Settings'),
        admin: __('Admin'),
      };

      return typeMap[val] || val;
    },
  }, {
    id: 'loginfo',
    text: __('Describe'),
    render(val, item) {
      let ret = __(utils.toCamel(item.get('logaction')));
      let groupname;
      const statusMap = {
        0: __('start'),
        1: __('success'),
        2: __('failed'),
      };

      if (val && val.get) {
        if (val.get('groupname') === 'Default') {
          groupname = __('Ungrouped Devices');
        }

        ret += ': ' + (val.get('name') || groupname || val.get('mac') || '');

        if (val.get('status') !== undefined) {
          ret += ' ' + statusMap[val.get('status')];
        }
      }

      return ret;
    },
  },
]);

const msg = {
  TITLE: __('Logs Info'),
  reconnect: __('Reconnect'),
  lock: __('Lock'),
  unlock: __('Unlock'),
  perPage: __('Items per page: '),
};

const selectOptions = [
  { value: 20, label: msg.perPage + '20' },
  { value: 50, label: msg.perPage + '50' },
  { value: 100, label: msg.perPage + '100' },
];

const typeArr = fromJS([
  __('ALL'),
  __('DEVICES'),
  __('CLIENTS'),
  __('SETTINGS'),
]);

const styles = {
  actionButton: {
    minWidth: '90px',
  },
};

// 原生的 react 页面
export class Logs extends PureComponent {
  constructor(props) {
    super(props);

    utils.binds(this, [
      'cleanAllLog',
      'onChangeSearchText',
      'onChangeType',
      'onChangeTableSize',
      'onPageChange',
      'handleSearch',
      'handleChangeQuery',
      'handleActions',
    ]);
  }
  componentWillMount() {
    this.handleSearch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.app.get('refreshAt') !== this.props.app.get('refreshAt')) {
      this.handleSearch();
    }
  }

  componentWillUnmount() {
    this.props.leaveLogsScreen();
  }

  handleSearch() {
    this.props.fetchLogs();
  }

  handleChangeQuery(data, needSearch) {
    this.props.changeLogsQuery(data);

    if (needSearch) {
      this.handleSearch();
    }
  }

  cleanAllLog() {
    let msg_text = __('Are you sure to clean all logs?');

    this.props.createModal({
      id: 'Logs',
      role: 'confirm',
      title: __('CONFIRM'),
      text: msg_text,
      apply: function () {
        this.props.cleanAllLog();
      }.bind(this),
    });
  }

  onChangeSearchText(val, e) {
    this.handleChangeQuery({
      search: val,
    });
  }

  onChangeType(data) {
    this.handleChangeQuery({
      type: data.value,
    }, true);
  }

  onChangeTableSize(option) {
    let val = '';

    if (option) {
      val = option.value;
    }

    this.handleChangeQuery({
      size: val,
      page: 1,
    }, true);
  }

  onPageChange(i) {
    this.handleChangeQuery({
      page: i,
    }, true);
  }

  render() {
    // 添加操作项
    const options = logsTableOptions;
    const { query, data, fetching } = this.props;
    const {
      onChangeSearchText,
      handleSearch,
      onChangeType,
      onChangeTableSize,
      onPageChange,
    } = this;

    return (
      <div>
        <h2>{msg.TITLE}</h2>
        <div className="m-action-bar">
          <Switchs
            className="fl"
            options={typeArr}
            value={this.props.query.get('type')}
            onChange={this.onChangeType}
          />

          <Button
            className="fl"
            text={__('Clean All Logs')}
            icon="trash"
            theme="danger"
            onClick={this.cleanAllLog}
          />
        </div>

        <Table
          options={options}
          list={data.get('list')}
          page={data.get('page')}
          pageQuery={{
            size: query.get('size'),
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onChangeTableSize}
          loading={fetching}
        />

      </div>
    );
  }
}

function mapStateToProps(state) {
  const myState = state.logs;

  return {
    app: state.app,
    fetching: myState.get('fetching'),
    query: myState.get('query'),
    updateAt: myState.get('updateAt'),
    data: myState.get('data'),
    page: myState.get('page'),
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
)(Logs);

export const logs = reducer;

