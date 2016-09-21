import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { fromJS, Map } from 'immutable';
import { FormGroup, FormInput, Search, Table } from 'shared/components';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import * as settingActions from 'shared/actions/settings';
import * as appActions from 'shared/actions/app';
import * as selfActions from './actions';
import reducer from './reducer';

const propTypes = {
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  fetch: PropTypes.func,
  save: PropTypes.func,
  selfState: PropTypes.instanceOf(Map),

  initSettings: PropTypes.func,
  fetchSettings: PropTypes.func,
  updateItemSettings: PropTypes.func,
  changePageObject: PropTypes.func,
  changeTableList: PropTypes.func,
  changeStartNo: PropTypes.func,
  changePerPageNum: PropTypes.func,
  changeSearchItem: PropTypes.func,
  changSearchList: PropTypes.func,
};

const defaultProps = {};

export default class SystemLogs extends Component {
  constructor(props) {
    super(props);
    this.onChangeLogSwitch = this.onChangeLogSwitch.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.onChangeSearchItem = this.onChangeSearchItem.bind(this);
  }

  componentWillMount() {
    this.props.initSettings({
      settingId: this.props.route.id,
      defaultData: {
        logList: [],
        logEnable: '0',
      },
    });
    this.props.fetch('goform/get_log_info')
        .then((json) => {
          if (json.state && json.state.code === 2000) {
            this.props.updateItemSettings({
              logEnable: json.data.logEnable,
            });
          }
          return json;
        })
        .then((json) => {
          if (json.state && json.state.code === 2000) {
            if (json.data.logEnable === '1') {
              this.props.fetch('goform/get_log_list')
                  .then((json2) => {
                    this.props.updateItemSettings({
                      logList: fromJS(json2.data.logList),
                    });
                    this.props.changeSearchItem('');
                    this.props.changSearchList(fromJS(json2.data.logList));
                    const totalLogs = json2.data.logList.length;
                    const perPageNum = this.props.selfState.get('perPageNum');
                    const totalPage = Math.ceil(totalLogs / perPageNum);
                    let nextPage;
                    if (totalPage < 2) { nextPage = -1; }
                    this.props.changePageObject(fromJS({
                      totalPage,
                      currPage: 1,
                      nextPage,
                      lastPage: totalPage,
                    }));
                    this.onChangePage(1);
                  });
            }
          }
        });
  }

  onChangeLogSwitch(data) {
    this.props.updateItemSettings({
      logEnable: data.value,
    });
    if (data.value === '1') {
      this.props.save('goform/set_log', { logEnable: '1' })
          .then((json) => {
            if (json.state && json.state.code === 2000) {
              this.props.fetch('goform/get_log_list')
                  .then((json2) => {
                    if (json.state && json.state.code === 2000) {
                      this.props.updateItemSettings({
                        logList: fromJS(json2.data.logList),
                      });
                    }
                  });
            }
          });
    } else {
      this.props.save('goform/set_log', { logEnable: '0' });
      this.props.updateItemSettings({
        logList: fromJS([]),
      });
    }
  }

  onChangePage(data) {
    const totalPage = this.props.selfState.getIn(['logPage', 'totalPage']);
    console.log('totalPage', totalPage);
    // console.log('selfState.get(searchItem)', this.props.selfState.get('searchItem'));
    // this.onChangeSearchItem(this.props.selfState.get('searchItem'));
    // let logList;
    // let perPageNum;
    // window.setTimeout(() => {
    //   logList = this.props.selfState.get('tableList').toJS();
    //   console.log(logList);
    //   perPageNum = this.props.selfState.get('perPageNum');
    // }, 0);
    const logList = this.props.selfState.get('searchList').toJS();
    const perPageNum = this.props.selfState.get('perPageNum');
    const listLen = logList.length;
    const startNo = (data - 1) * perPageNum;
    console.log(startNo, listLen);
    const list = [];
    let currPage;
    let nextPage;
    if (data < totalPage && (data + 1) <= totalPage) {
      currPage = data;
      nextPage = data + 1;
    } else if (data === totalPage) {
      currPage = data;
      nextPage = -1;
    }
    this.props.changePageObject(fromJS({
      totalPage,
      currPage,
      nextPage,
      lastPage: totalPage,
    }));
    if (startNo > listLen) {
      throw new Error(_('The page does not exist'));
    }
    this.props.changeStartNo(startNo + 1);
    for (let i = 0; i < perPageNum && (startNo + i) < listLen; i++) {
      list.push(logList[startNo + i]);
    }
    this.props.changeTableList(fromJS(list));
  }

  onChangeNumOfPerPage(data) {
    this.props.changePerPageNum(data.value);
    this.onChangeSearchItem(this.props.selfState.get('searchItem'));
    window.setTimeout(() => {
      this.props.changePageObject(fromJS({
        totalPage: Math.ceil(this.props.selfState.get('searchList').size / data.value),
        currPage: 1,
      }));
      this.onChangePage(1);
    }, 0);
  }

  onChangeSearchItem(val) {
    console.log('val', val);
    const temp = val;
    this.props.changeSearchItem(val);
    // if (temp.replace(/\s/g, '') === '') {
    //   temp = ' ';
    // }
    const searchList = [];
    const logList = this.props.store.getIn(['curData', 'logList']).toJS();
    for (const log of logList) {
      // console.log(log.time.indexOf(temp));
      // console.log(log.content.indexOf(temp));
      if (log.time.indexOf(temp) !== -1 || log.content.indexOf(temp) !== -1) {
        searchList.push(log);
      }
    }

    // this.props.changeTableList(fromJS(searchList));
    console.log('searchList.length', searchList.length);
    console.log('this.props.selfState.get(perPageNum)', this.props.selfState.get('perPageNum'));
    this.props.changSearchList(fromJS(searchList));
    this.props.changePageObject(fromJS({
      totalPage: Math.ceil(searchList.length / this.props.selfState.get('perPageNum')),
    }));
  }

  render() {
    let n = 0;
    const systemLogOptions = fromJS([
      {
        id: 'id',
        text: _('No.'),
        transform: function () {
          return this.props.selfState.get('startNoForEveryPage') + n++;
        }.bind(this),
        width: '80px',
      },
      {
        id: 'time',
        text: _('Time'),
        width: '200px',
      },
      {
        id: 'content',
        text: _('Content'),
      },
    ]);

    const numOfPerPageOptions = [
      { value: 20, label: '20' },
      { value: 30, label: '30' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ];

    return (
      <div>
        <FormGroup
          type="checkbox"
          label={_('System Log')}
          checked={this.props.store.getIn(['curData', 'logEnable']) === '1'}
          onChange={(data) => this.onChangeLogSwitch(data)}
        />
        {
          this.props.store.getIn(['curData', 'logEnable']) === '1' ? (
            <div
              style={{
                width: '90%',
                margin: 'auto',
              }}
            >
              <div className="m-action-bar">
                <Search
                  value={this.props.selfState.get('searchItem')}
                  onChange={(val, e) => {
                    this.onChangeSearchItem(val, e);
                    window.setTimeout(() => {
                      this.onChangePage(1);
                    }, 0);
                  }}
                />
                <FormGroup
                  label={_('Items Per Page')}
                  type="select"
                  options={numOfPerPageOptions}
                  value={this.props.selfState.get('perPageNum')}
                  onChange={(data) => this.onChangeNumOfPerPage(data)}
                />
              </div>
              <Table
                className="table"
                options={systemLogOptions}
                list={this.props.selfState.get('tableList')}
                page={this.props.selfState.get('logPage')}
                onPageChange={(data) => this.onChangePage(data)}
              />
            </div>
          ) : null
        }

      </div>
    );
  }
}

SystemLogs.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.settings,
    selfState: state.systemlogs,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    settingActions,
    selfActions
  ), dispatch);
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SystemLogs);

export const systemlogs = reducer;