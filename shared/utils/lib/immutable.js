// 对 immutable 数据的操作

var immutableUtils = {
  getFormOptions: function(screenOptions) {
    var ret = screenOptions;

    if(!ret) {
      return null;
    }

    ret = ret.map(function(item) {
        var commonOption = {
          id: item.get('id'),
          label: item.get('text') || item.get('label'),
          fieldset: item.get('fieldset'),
          legend: item.get('legend'),
          options: item.get('options'),
        };
        var retVal = item.clear()
          .merge(commonOption)
          .merge(item.get('formProps'))
          .filterNot(function(val) {
            return typeof val === 'undefined';
          });

        if (item.get('noForm')) {
          retVal = 'noForm';
        }

        return retVal;
      })
      .filterNot(function(x) {
        return x === 'noForm';
      })
      .groupBy(function(item) {
        return item.get('fieldset')
      })
      .toList();

    // 如果只有一组,则直接获取第一组List
    // if (ret.size === 1) {
    //   ret = ret.get(0);
    // }
    return ret;
  },

  getQueryFormOptions: function(screenOptions) {
    var ret = screenOptions;

    if(!ret) {
      return null;
    }

    ret = ret.filter(function(x) {
        return x.get('queryable');
      }).map(function(item) {
        var commonOption = {
          id: item.get('id'),
          label: item.get('text') || item.get('label'),
          fieldset: item.get('fieldset'),
          legend: item.get('legend'),
          options: item.get('options'),
        };
        var retVal = item.clear()
          .merge(commonOption)
          .merge(item.get('formProps'));

        return retVal;
      })
      .toList();

    return ret;
  },

  getDefaultData: function(screenOptions, key) {
    var defaultKey = key || 'defaultValue';
    var ret = {};

    // 初始化默认值对象
    screenOptions.forEach((item) => {
      var defaultVal = item.get(defaultKey);
      if (defaultVal !== undefined) {
        ret[item.get('id')] = defaultVal;
      }
    });

    return ret;
  },

  getValidatorOptions: function(screenOptions) {
    var ret = screenOptions;

    if(!ret) {
      return null;
    }

    ret = ret.map(
      (item) => item.delete('formProps')
    ).filterNot((item) => item.get('noTable'));

    return ret;
  },

  getTableOptions: function(screenOptions) {
    var ret = screenOptions;

    if(!ret) {
      return null;
    }

    ret = ret.map(
      (item) => item.delete('formProps')
    ).filterNot((item) => item.get('noTable'));

    return ret;
  }
}

// exports
if (typeof module === "object" && typeof module.exports === "object" ) {
  module.exports = immutableUtils;
}