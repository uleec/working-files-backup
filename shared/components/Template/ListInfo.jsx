import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
  Table, Select, Search, Button, Modal, FormGroup,
  FormContainer,
} from 'shared/components';

const msg = {
  perPage: _('Items per page: '),
};
const selectOptions = [
  { value: 20, label: `${msg.perPage}20` },
  { value: 50, label: `${msg.perPage}50` },
  { value: 100, label: `${msg.perPage}100` },
];

const propTypes = {
  // 组件通用选项
  title: PropTypes.string,
  listTitle: PropTypes.string,
  app: PropTypes.instanceOf(Map),
  store: PropTypes.instanceOf(Map),
  route: PropTypes.object,
  defaultQueryData: PropTypes.object,
  defaultSettingsData: PropTypes.object,
  tableOptions: PropTypes.oneOfType([
    PropTypes.instanceOf(List), PropTypes.array,
  ]),
  queryFormOptions: PropTypes.oneOfType([
    PropTypes.instanceOf(List), PropTypes.array,
  ]),

  // 通用控制开关选项
  actionable: PropTypes.bool,
  addable: PropTypes.bool,
  editable: PropTypes.bool,
  deleteable: PropTypes.bool,
  searchable: PropTypes.bool,
  selectable: PropTypes.bool,
  noTitle: PropTypes.bool,

  // 通用操作函数
  initList: PropTypes.func,
  fetchList: PropTypes.func,
  changeListQuery: PropTypes.func,
  changeListActionQuery: PropTypes.func,
  leaveListScreen: PropTypes.func,
  selectListItem: PropTypes.func,
  onListAction: PropTypes.func,

  // List 全局 Settings 相关
  hasSettingsSaveButton: PropTypes.bool,
  settingsFormOption: PropTypes.oneOfType([
    PropTypes.instanceOf(List), PropTypes.array,
  ]),
  updateListSettings: PropTypes.func,
  saveListSettings: PropTypes.func,

  // 数据验证
  validateAll: PropTypes.func,
  reportValidError: PropTypes.func,
  resetVaildateMsg: PropTypes.func,

  // 添加，编辑具体列表项相关
  modalSize: PropTypes.string,
  editFormLayout: PropTypes.string,
  defaultEditData: PropTypes.object,
  editFormOptions: PropTypes.oneOfType([
    PropTypes.instanceOf(List), PropTypes.array,
  ]),
  addListItem: PropTypes.func,
  editListItemByIndex: PropTypes.func,
  closeListItemModal: PropTypes.func,
  updateEditListItem: PropTypes.func,

  // React node 元素
  children: PropTypes.node,
  actionBarChildren: PropTypes.node,
};
const defaultProps = {
  actionable: false,
  addable: true,
  editable: true,
  deleteable: true,
};

// 原生的 react 页面
class ListInfo extends React.Component {
  constructor(props) {
    const initOption = {
      listId: props.route.id,
      formUrl: props.route.formUrl,
      fetchUrl: props.route.fetchUrl,
      saveUrl: props.route.saveUrl,
    };
    super(props);

    if (props.defaultEditData) {
      initOption.defaultEditData = props.defaultEditData;
    }

    if (props.defaultQueryData) {
      initOption.query = props.defaultQueryData;
    }
    if (props.defaultSettingsData) {
      initOption.defaultSettingsData = props.defaultSettingsData;
    }

    this.props.initList(initOption);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.binds('onChangeQuery', 'onPageChange', 'onSave', 'onCloseEditModal',
        'onChangeSearchText', 'onChangeType', 'onChangeTableSize', 'onRemoveSelectItems',
        'onSaveSettings');
  }

  componentWillMount() {
    const { actionable, editable, deleteable, tableOptions } = this.props;

    // 初始选项，添加操作项
    if (actionable && (editable || deleteable) && tableOptions) {
      this.ListTableOptions = tableOptions.push(Map({
        id: 'actions',
        text: _('Actions'),
        width: '180',
        transform: (val, item, index) => (
          <div className="action-btns">
            {
              editable ? (
                <Button
                  icon="edit"
                  text={_('Edit')}
                  size="sm"
                  onClick={() => {
                    this.props.editListItemByIndex(index);
                  }}
                />
              ) : null
            }

            {
              deleteable ? (
                <Button
                  icon="trash"
                  text={_('Delete')}
                  size="sm"
                  onClick={() => {
                    this.onRemoveItem(index);
                  }}
                />
              ) : null
            }
          </div>
        ),
      }));
    } else {
      this.ListTableOptions = tableOptions;
    }

    this.onFetchList();
  }
  componentWillUpdate(nextProps) {
    this.formUrl = nextProps.route.formUrl;
  }
  componentDidUpdate(prevProps) {
    if (prevProps.app.get('refreshAt') !== this.props.app.get('refreshAt')) {
      this.onFetchList();
    }
  }
  componentWillUnmount() {
    if (this.props.leaveListScreen) {
      this.props.leaveListScreen();
    }
  }
  onChangeSearchText(val) {
    this.onChangeQuery({
      search: val,
    }, true);
  }
  onChangeType(data) {
    this.onChangeQuery({
      type: data.value,
    }, true);
  }
  onChangeTableSize(data) {
    this.onChangeQuery({
      size: data.value,
      page: 1,
    }, true);
  }
  onSave() {
    if (this.props.validateAll) {
      this.props.validateAll()
        .then((errMsg) => {
          if (errMsg.isEmpty()) {
            this.props.onListAction();
          }
        });
    }
  }
  onCloseEditModal() {
    if (this.props.closeListItemModal) {
      this.props.closeListItemModal();
    }
    if (this.props.resetVaildateMsg) {
      this.props.resetVaildateMsg();
    }
  }

  onPageChange(i) {
    this.onChangeQuery({
      page: i,
    }, true);
  }
  onRemoveItem(i) {
    this.props.changeListActionQuery({
      action: 'remove',
      index: i,
    });
    this.props.onListAction();
  }

  onChangeQuery(data, needRefresh) {
    if (this.props.changeListQuery) {
      this.props.changeListQuery(data);
    }

    if (needRefresh) {
      this.onFetchList();
    }
  }
  onSaveSettings() {
    if (this.props.validateAll) {
      this.props.validateAll()
        .then((errMsg) => {
          if (errMsg.isEmpty()) {
            this.props.saveListSettings();
          }
        });
    }
  }
  onRemoveSelectItems() {

  }
  onFetchList() {
    if (this.props.fetchList) {
      this.props.fetchList();
    }
  }

  binds(...methods) {
    methods.forEach((method) => {
      if (typeof this[method] === 'function') {
        this[method] = this[method].bind(this);
      }
    });
  }

  render() {
    const {
      store, route, app, modalSize, title, listTitle,
      selectable, deleteable, searchable, addable, actionable, noTitle,
      editFormLayout, editFormOptions, defaultEditData,
      settingsFormOption, updateListSettings, hasSettingsSaveButton,
      queryFormOptions,
      actionBarChildren,
    } = this.props;
    const myListId = store.get('curListId');
    const page = store.getIn([myListId, 'data', 'page']);
    const list = store.getIn([myListId, 'data', 'list']);
    const curSettings = store.getIn([myListId, 'curSettings']);
    const editData = store.getIn([myListId, 'data', 'edit']);
    const query = store.getIn([myListId, 'query']);
    const actionQuery = store.getIn([myListId, 'query']);
    const saveUrl = route.saveUrl || route.formUrl;
    const fetchUrl = route.fetchUrl || route.formUrl;
    const leftChildrenNode = [];
    let pageSelectClassName = 'fr';

    // 数据未初始化不渲染
    if (myListId === 'base') {
      return null;
    }

    if (!searchable && !queryFormOptions && !actionBarChildren &&
        (actionable && !addable)) {
      pageSelectClassName = 'fl';
    }

    //
    if (actionable && addable) {
      leftChildrenNode.push(
        <Button
          icon="plus"
          key="add"
          theme="primary"
          text={_('Add')}
          onClick={() => {
            this.props.addListItem(defaultEditData);
          }}
        />
      );
    }
    if (searchable) {
      leftChildrenNode.push(
        <Search
          value={query.get('text')}
          key="search"
          onChange={this.onChangeSearchText}
          onSearch={this.handleSearch}
        />
      );
    }

    if (actionable && selectable && deleteable) {
      leftChildrenNode.push(
        <Button
          icon="trash-o"
          key="delete"
          text={_('Remove Selected')}
          onClick={() => {
            this.onRemoveSelectItems();
          }}
        />
      );
    }
    if (actionBarChildren) {
      leftChildrenNode.push(actionBarChildren);
    }

    return (
      <div className="t-list-info">
        {
          noTitle ? null : (
            <h2 className="t-list-info__title">{title || route.text}</h2>
          )
        }
        {
          settingsFormOption ? (
            <FormContainer
              options={settingsFormOption}
              data={curSettings}
              onChangeData={updateListSettings}
              onSave={this.onSaveSettings}
              invalidMsg={app.get('invalid')}
              validateAt={app.get('validateAt')}
              isSaving={app.get('saving')}
              hasSaveButton={hasSettingsSaveButton}
            />
          ) : null
        }

        {
          listTitle ? (
            <h2 className="t-list-info__title">{listTitle}</h2>
          ) : null
        }

        <FormContainer
          action={fetchUrl}
          method="GET"
          layout="flow"
          data={query}
          options={queryFormOptions}
          isSaving={app.get('fetching')}
          invalidMsg={app.get('invalid')}
          validateAt={app.get('validateAt')}
          onSave={this.onSave}
          onChangeData={this.props.changeListQuery}
          onValidError={this.props.reportValidError}
          leftChildren={leftChildrenNode}
          rightChildren={
              page ? (
                <FormGroup className="fr">
                  <Select
                    className={pageSelectClassName}
                    value={query.get('size')}
                    onChange={this.onChangeTableSize}
                    options={selectOptions}
                    searchable={false}
                    clearable={false}
                  />
                </FormGroup>
            ) : null
          }
        />
        {
          this.ListTableOptions ? (
            <Table
              className="table"
              options={this.ListTableOptions}
              list={list}
              page={page}
              onPageChange={this.onPageChange}
              loading={app.get('fetching')}
              selectable={selectable}
              onSelectRow={this.props.selectListItem}
            />
          ) : null
        }
        {
          editFormOptions ? (
            <Modal
              isShow={!editData.isEmpty()}
              title={editData.get('myTitle')}
              onOk={this.onSave}
              onClose={this.onCloseEditModal}
              size={modalSize}
              noFooter
            >
              <FormContainer
                action={saveUrl}
                layout={editFormLayout}
                isSaving={app.get('saving')}
                data={editData}
                actionQuery={actionQuery}
                invalidMsg={app.get('invalid')}
                validateAt={app.get('validateAt')}
                options={editFormOptions}
                onSave={this.onSave}
                onChangeData={this.props.updateEditListItem}
                onValidError={this.props.reportValidError}
                hasSaveButton
              />
            </Modal>
          ) : null
        }
        {
          this.props.children
        }
      </div>
    );
  }
}

ListInfo.propTypes = propTypes;
ListInfo.defaultProps = defaultProps;

export default ListInfo;

