import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import PureComponent from '../Base/PureComponent';
import FormInput from './FormInput';

function isValidateMyForm(validateAt, myForm) {
  let validateForm = '__all__';
  if (typeof validateAt === 'string') {
    validateForm = validateAt.split('.')[0];
  }

  return (
    validateForm === '__all__' || myForm === validateForm
  );
}
function noop() {}

const propTypes = {
  onValidError: PropTypes.func,
  errMsg: PropTypes.string,
  help: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  id: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  validateAt: PropTypes.string,
  name: PropTypes.string,
  validator: PropTypes.object,
  display: PropTypes.string,
  role: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  inputStyle: PropTypes.object,
  children: PropTypes.node,
  appendRender: PropTypes.func,
  'data-label': PropTypes.string,
  form: PropTypes.string,
  showLabel: PropTypes.bool,
  multi: PropTypes.bool,
  options: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  type: PropTypes.string,
};

const defaultProps = {
  showLabel: true,
  validator: {
    check: noop,
    checkClear: noop,
  },

  // 默认所有值为空， 防止在 controlled 与 uncontrolled 间切换
  // https://fb.me/react-controlled-components
  value: '',
};

function isStringBe(str, nextStr) {
  return `${str}` === `${nextStr}`;
}
function isContainer(strArr, containerStr) {
  return strArr.indexOf(`${containerStr}`) !== -1;
}

function isNotSelectValue(option) {
  const { options, value, type, multi } = option;
  let myOptions = options;
  let i;
  let len;
  let item;
  let curVal = value === undefined ? '' : value;
  let judgeFunc = isStringBe;
  let ret = false;

  if ('select,switch,'.indexOf(`${type},`) !== -1 && options) {
    if (multi) {
      curVal = curVal.split(',');
      judgeFunc = isContainer;
    }

    if (options.toJS) {
      myOptions = options.toJS();
    }
    len = myOptions.length;

    for (i = 0; i < len; i += 1) {
      item = myOptions[i];
      if (judgeFunc(curVal, item.value)) {
        return false;
      }
    }

    ret = true;
  }

  return ret;
}

class FormGroup extends PureComponent {
  constructor(props) {
    super(props);

    this.check = this.check.bind(this);
    this.checkClear = this.checkClear.bind(this);
    this.clearValidError = this.clearValidError.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const nextValue = nextProps.value;
    const curValue = this.props.value;

    if (curValue === undefined && nextValue !== curValue) {
      invariant(true, `Formgroup ${this.props.id} switch between uncontrolled and controlled`);
    }
  }

  componentDidUpdate(prevProps) {
    const { value, validateAt, form } = this.props;

    // 数据为空或有数据验证对象，需进行数据验证
    if (this.props.validator || value === '' || value === undefined) {
      // 如果组是可用的
      if (!this.props.disabled) {
        if (prevProps.value !== value) {
          this.checkClear();
        } else if (prevProps.validateAt !== validateAt) {
          if (this.myRef.offsetWidth > 0 &&
              isValidateMyForm(validateAt, form)) {
            this.check();
          }
        }
      } else {
        this.clearValidError();
      }
    }
  }

  // 验证不确定的错误
  check() {
    const { name, label, value, required, options, type, multi } = this.props;
    let checkResult;

    // 空字符串验证, 或者值 不在 options 列表中
    if (value === '' || value === undefined ||
        isNotSelectValue({
          options,
          value,
          type,
          multi,
        })) {
      if (required) {
        checkResult = __('%s is required', label || this.props['data-label']);
      }

    // 不为空，validator验证对象验证
    } else if (this.props.validator) {
      checkResult = this.props.validator.check(value);
    }

    // 只有onValidError函数存在时才上报错误数据
    if (this.props.onValidError) {
      this.props.onValidError({ name, checkResult });
    }
  }

  // 验证可确定的错误
  checkClear() {
    const { name, value } = this.props;
    let checkResult;

    if (this.props.validator) {
      checkResult = this.props.validator.checkClear(value);
      if (this.props.onValidError) {
        this.props.onValidError({ name, checkResult });
      }
    }
  }

  // clearError
  clearValidError() {
    if (this.props.onValidError) {
      this.props.onValidError({
        name: this.props.name,
        checkResult: undefined,
      });
    }
  }

  render() {
    const {
      required, role, id, label, display, disabled, name, value, type,
    } = this.props;
    const { style, help, children, errMsg, showLabel,
      className, appendRender, ...restProps
    } = this.props;
    const { check, checkClear } = this;
    let groupClassName = 'form-group';

    if (role) {
      groupClassName += ` form-group--${role}`;
    }

    if (errMsg) {
      groupClassName = `${groupClassName} form-group--error`;
    }

    if (className) {
      groupClassName = `${groupClassName} ${className}`;
    }

    if (display) {
      groupClassName = `${groupClassName} form-group--${display}`;
    }

    // 如果是隐藏，直接渲染 input
    if (type === 'hidden') {
      return (
        <input
          type="hidden"
          name={name}
          value={value}
          ref={
            (elem) => {
              this.myRef = elem;
            }
          }
        />
      );
    }

    return (
      <div
        className={groupClassName}
        style={style}
        ref={
          (elem) => {
            this.myRef = elem;
          }
        }
      >
        {
          label && showLabel ? (
            <label htmlFor={id}>
              {label}
              {required ? <span className="text-required">*</span> : null}
            </label>
          ) : null
        }

        <div className="form-control">
          {
            disabled ? (
              <input
                type="hidden"
                name={name}
                value={value}
              />
            ) : null
          }
          {
            children ? React.Children.map(children, (elem) => {
              let ret = elem;

              if (elem && elem.type && elem.type.name === 'FormInput') {
                ret = React.cloneElement(elem, {
                  check,
                  checkClear,
                  isFocus: !!errMsg,
                });
              }

              return ret;
            }) : (
              <FormInput
                {...restProps}
                isFocus={!!errMsg}
                check={this.check}
                checkClear={this.checkClear}
                style={this.props.inputStyle}
              />
            )
          }
          {
            appendRender ? appendRender() : null
          }
          {
            help ? <span className="help">{help}</span> : null
          }

          {
            errMsg ? <span className="error">{errMsg}</span> : null
          }
        </div>
      </div>);
  }
}

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
