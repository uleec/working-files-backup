// 对 immutable 数据的操作
var warning = require('./warning');

function isImmutableList($$list) {
  return $$list && $$list.constructor && typeof $$list.constructor.isList === 'function';
}
function isImmutableMap($$list) {
  return $$list && $$list.constructor && typeof $$list.constructor.isMap === 'function';
}

var immutableUtils = {
  getFormOptions: function ($$options) { // 构造表格项的编辑内容
    var ret = $$options;

    if (!isImmutableList(ret)) {
      return null;
    }

    ret = ret.map(function (item) {
        var commonOption = {
          id: item.get('id'),
          linkId: item.get('linkId'),
          label: item.get('text') || item.get('label'),
          fieldset: item.get('fieldset'),
          fieldsetOption: item.get('fieldsetOption'),
          legend: item.get('legend'),
          options: item.get('options'),
          notEditable: item.get('notEditable'),
        };
        var retVal = item.clear()
          .merge(commonOption)
          .merge(item.get('formProps'))
          .filterNot(function (val) {
            return typeof val === 'undefined';
          });

        if (item.get('noForm')) {
          retVal = 'noForm';
        }

        return retVal;
      })
      .filterNot(function (x) { // listOptions中又不需要编辑的项目则添加该bool值
        return x === 'noForm';
      })
      .groupBy(function (item) { // 使用fieldset分组
        return item.get('fieldset')
      })
      .toList();

    // 如果只有一组,则直接获取第一组List
    if (ret.size === 1) {
      ret = ret.get(0);
    }
    return ret;
  },

  /**
   * 获取默认值对象
   *
   * $$options(List)  配置集合
   * $$options(String)  默认值的名称，默认 ‘defaultValue’
   *
   * return Object
   */
  getDefaultData: function ($$options, key) {
    var defaultKey = key || 'defaultValue';
    var ret = {};

    if (!isImmutableList($$options)) {
      warning(false, 'immutableUtils.getDefaultData param need immutable.js List data, but type is ' + typeof $$options);
      return null;
    }

    function fillRet($$item) {
      var defaultVal = $$item.get(defaultKey);

      if (typeof defaultVal === undefined) {
        defaultVal = $$item.getIn(['formProps', defaultKey]);
      }

      // 如果是列表继续循环
      if (isImmutableList($$item)) {
        $$item.forEach(function($$subItem) {
          fillRet($$subItem);
        })
      } else if (defaultVal !== undefined) {
        ret[$$item.get('id')] = defaultVal;
      }
    }

    // 初始化默认值对象
    fillRet($$options);

    return ret;
  },

  /**
   *
   */
  getNumberKeys: function($$options) {
    var ret = [];

    if(!isImmutableList($$options)) {
      return ret;
    }

    function walkList($$list) {
      var curId;
      var linkId;

      // 如果是 List 类型
      if (isImmutableList($$list)) {
        $$list.forEach(
          function($$item) {
            walkList($$item);
          }
        );

      // 如果是数字类型对象
      } else if ($$list.get('dataType') === 'number') {
        curId = $$list.get('id');
        linkId = $$list.get('linkId');

        ret.push(curId);

        if(linkId) {
          ret.push(linkId);
        }
      }
    }

    walkList($$options)

    return ret;
  },

  /**
   *
   */
  getTableOptions: function ($$options) {
    var ret = $$options;

    if (!isImmutableList(ret)) {
      return null;
    }

    ret = ret.map(function($$item) {
      return $$item.delete('formProps')
    }).filterNot(function($$item) {
      return $$item.get('noTable');
    })
    return ret;
  },

  getChanged: function ($$newData, $$oldData) {
    var $$ret = $$newData;

    if (!isImmutableMap($$newData) || !isImmutableMap($$newData)) {
      return null;
    }

    $$ret = $$newData.filter(
      function(val, key) {
        var ret = false;
        var oldVal = $$oldData.get(key);

        if (oldVal !== undefined && oldVal !== val) {
          ret = true;
        }

        return ret;
      }
    );

    return $$ret;
  },


  selectList: function($$list, data, $$selectedList) {
    if(!isImmutableList($$list) || !data) {
      warning(false, 'immutableUtils.selectList need params $$list and data');
      return null;
    }
    var $$retList = $$list;
    var $$newSelectedList = $$selectedList || $$retList.clear();
    var selectListIndex = -1;

    // 只操作其中一项
    if (data.index !== -1) {
      $$retList = $$retList.setIn([data.index, '__selected__'], data.selected);
      selectListIndex = $$newSelectedList.indexOf(data.index);

      if (data.selected) {
        if (selectListIndex === -1) {
          $$newSelectedList = $$newSelectedList.push(data.index);
        }

      // 已存在选择中列表中
      } else if (selectListIndex !== -1) {
        $$newSelectedList = $$newSelectedList.delete(selectListIndex);
      }


    // 操作全部项
    } else {
      $$newSelectedList = $$retList.clear();

      if (data.selected) {
        $$retList = $$retList.map(function(item, index) {
          $$newSelectedList = $$newSelectedList.push(index);

          return item.set('__selected__', true);
        });
      } else {
        $$retList = $$retList.map(function(item) {
          return item.set('__selected__', false)
        });
      }
    }

    return {
      $$list: $$retList,
      selectedList: $$newSelectedList
    };
  },

  toNumberWithKeys: function($$data, $$keysArr) {
    var $$ret = $$data;

    if ($$ret) {
      $$keysArr.forEach(
        function(key) {
          var curVal = $$ret.get(key);

          if (curVal !== undefined) {
            $$ret = $$ret.set(key, parseInt(curVal));
          }
        }
      );
    }

    return $$ret;
  }
}

// exports
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = immutableUtils;
}
