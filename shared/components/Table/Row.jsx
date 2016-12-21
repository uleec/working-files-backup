import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Checkbox from 'shared/components/Form/Checkbox';

const propTypes = {
  options: PropTypes.object,
  isTh: PropTypes.bool,
  item: PropTypes.object,
  index: PropTypes.number,
  selectable: PropTypes.bool,
  isSelectAll: PropTypes.bool,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
};

const defaultProps = {
  isTh: false,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }
  onSelect(index_, e) {
    if (this.props.onSelect) {
      this.props.onSelect({
        index: index_,
        selected: e.target.checked,
      });
    }
  }
  render() {
    const { isTh, options, isSelectAll, selectable, item, index } = this.props;
    let tds;

    // 渲染表格头部 th
    if (isTh) {
      tds = options.map((option, i) =>
        <th key={`tableRow${i}`} width={option.get('width')}>
          {option.get('text') || option.get('label')}
        </th>,
      );

      if (selectable) {
        tds = tds.unshift((
          <th width="15" key="tableRow_select">
            <Checkbox
              checked={isSelectAll}
              theme="square"
              onChange={(e) => {
                this.onSelect(-1, e);
              }}
            />
          </th>
        ));
      }

    // 渲染表格内容 td
    } else {
      tds = options.map((option, i) => {
        const id = option.get('id');
        const filterObj = option.get('filterObj');
        const thisKey = `tableRow${i}`;
        const originVal = item.get(id);
        let currVal = originVal;
        let currItemArr = [];
        let currValArr = [];

        // 优先过滤处理值
        if (filterObj && typeof filterObj.transform === 'function') {
          currVal = filterObj.transform(currVal);
        }

        // 如果没有自定义渲染函数，依据配置渲染
        if (!option.get('transform')) {
          if (currVal !== undefined) {
            // options 则需要渲染 value 对应的 label 值
            if (option.get('options') && option.get('options').size > 0) {

              // 如果是多选
              if (option.get('multi')) {
                currItemArr = currVal.split(',').map(
                  itemVal => option.get('options').find((myMap) => {
                    let ret = false;

                    if (myMap && typeof myMap.get === 'function') {
                      ret = myMap.get('value') === itemVal;
                    } else {
                      ret = myMap === itemVal;
                    }
                    return ret;
                  }),
                );

              // 单选
              } else {
                currItemArr.push(
                  option.get('options').find((myMap) => {
                    let ret = false;

                    if (myMap && typeof myMap.get === 'function') {
                      ret = myMap.get('value') === currVal;
                    } else {
                      ret = myMap === currVal;
                    }
                    return ret;
                  }),
                );
              }

              currValArr = currItemArr.map(
                ($$currItem) => {
                  let retVal = '';

                  if ($$currItem) {
                    // 如果是 map 对象
                    if (typeof $$currItem.get === 'function') {
                      if (typeof $$currItem.get('render') === 'function') {
                        retVal = $$currItem.get('render')();
                      } else {
                        retVal = $$currItem.get('label');
                      }

                    // 文本
                    } else {
                      retVal = $$currItem;
                    }
                  }
                  return retVal;
                },
              ).filter(
                curVal => !!curVal,
              );
            }

            // 如果 node列表长度大于0，需要添加分割符 ','
            if (currValArr.length > 1) {
              currVal = [];
              currValArr.forEach(
                (curVal, n) => {
                  currVal.push(curVal);

                  if (n < currValArr.length - 1) {
                    currVal.push(', ');
                  }
                },
              );
            } else if (currValArr.length === 1) {
              currVal = currValArr[0];
            }

          // 显示默认值
          } else {
            currVal = option.get('defaultValue') || '';
          }

        // 使用自定义渲染函数
        } else {
          currVal = option.get('transform')(currVal, item, index);
        }

        return (
          <td key={thisKey}>
            { currVal }
          </td>
        );
      });

      if (selectable) {
        tds = tds.unshift((
          <td width="15" key="tableRow_select">
            <Checkbox
              theme="square"
              checked={!!item.get('__selected__')}
              onChange={(e) => {
                this.onSelect(index, e);
              }}
            />
          </td>
        ));
      }
    }

    return (
      <tr onClick={this.props.onClick}>
        {tds}
      </tr>
    );
  }
}

Row.propTypes = propTypes;
Row.defaultProps = defaultProps;

export default Row;
