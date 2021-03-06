import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from '../Base/PureComponent';
import Input from './atom/Input';

const propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['md', 'lg']),
  theme: PropTypes.oneOf(['square']),
  value: PropTypes.any,
  id: PropTypes.string,
  options: PropTypes.object,
  style: PropTypes.object,
  text: PropTypes.string,
};

const defaultProps = {
  type: 'radio',
};

class Radios extends PureComponent {
  render() {
    const { options, size, theme, className, style, text, ...restProps } = this.props;
    let { value, id } = this.props;
    let classNames = 'a-radio';
    const label = options && options.label;

    value = value === undefined ? '1' : value;

    if (!id) {
      id = `radio_${Math.random()}`;
    }

    if (size) {
      classNames = `${classNames} a-radio--${size}`;
    }

    if (theme) {
      classNames = `${classNames} a-radio--${theme}`;
    }

    if (className) {
      classNames = `${classNames} a-radio--${className}`;
    }

    return (
      <label htmlFor={id} className={classNames} style={style}>
        <Input
          {...restProps}
          style={style}
          className="a-radio__input"
          id={id}
          value={value}
        />
        <label htmlFor={id} />
        {
          text ? (
            <span className="a-radio__text">{text}</span>
          ) : null
        }
      </label>
    );
  }
}

Radios.propTypes = propTypes;
Radios.defaultProps = defaultProps;

export default Radios;
