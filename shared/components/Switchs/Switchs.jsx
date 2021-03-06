import React from 'react';
import PropTypes from 'prop-types';
import { List, fromJS } from 'immutable';
import utils from 'shared/utils';
import PureComponent from '../Base/PureComponent';

const propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'lg']),
  onChange: PropTypes.func,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  style: PropTypes.object,
  role: PropTypes.oneOf(['switch']),
  minWidth: PropTypes.string,
  disabled: PropTypes.any,
  readOnly: PropTypes.any,
};

const defaultProps = {
  role: 'switch',
  disabled: false,
  readOnly: false,
};

class Switchs extends PureComponent {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e, data) {
    e.preventDefault();
    if (data.value !== this.props.value) {
      if (this.props.onChange) {
        this.props.onChange(data);
      }
    }
  }

  render() {
    const {
      size, className, options, value, role,
      minWidth, style, disabled, readOnly,
    } = this.props;
    const itemStyle = {
      minWidth,
    };
    let classNames = 'm-switch';
    let width = 50;
    let optionsList;

    if (!List.isList(options)) {
      optionsList = fromJS(options);
    } else {
      optionsList = options;
    }

    // 如果 switch 样式为block或者 设置了固定宽度
    // item将平分器宽度
    if (style && (style.display === 'block' || style.width)) {
      width = utils.cutFixedFloat(100 / optionsList.size, 3);
      itemStyle.width = `${width}%`;
    }

    if (size) {
      classNames = `${classNames} m-switch--${size}`;
    }

    if (disabled || readOnly) {
      classNames = `${classNames} m-switch--disabled`;
    }

    if (className) {
      classNames = `${classNames} ${className}`;
    }

    return (
      <div
        className={classNames}
        style={this.props.style}
        role={role}
      >
        {
          options ? optionsList.map((item, i) => {
            let curDisabled = disabled;
            let thisKey = i;
            let myClassName = 'm-switch__item';
            let val;
            let label;

            if (typeof item.get === 'function') {
              val = item.get('value');
              label = item.get('label');
              thisKey = item.get('id') || item.get('name') || '';
              curDisabled = disabled || item.get('disabled');
            } else {
              val = `${i}`;
              label = item;
            }

            if (val === `${value}` || val === value) {
              myClassName += ' active';
            }

            if (curDisabled) {
              myClassName += ' disabled';
            }

            return (
              <button
                key={`${thisKey}${val}`}
                className={myClassName}
                value={val}
                disabled={curDisabled}
                onClick={(e) => {
                  if (!readOnly && !curDisabled) {
                    this.onClick(e, {
                      value: val,
                      label,
                    });
                  }
                }}
                style={itemStyle}
              >
                {label}
              </button>
            );
          }) : null
        }
      </div>
    );
  }
}

Switchs.propTypes = propTypes;
Switchs.defaultProps = defaultProps;

export default Switchs;
