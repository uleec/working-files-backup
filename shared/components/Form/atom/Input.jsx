import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import utils from '../../../utils';

const propTypes = {
  isFocus: PropTypes.bool,
};

const defaultProps = {
  type: 'text',
};

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidUpdate() {
    if (this.props.isFocus) {
      this.myRef.focus();
    }
  }
  render() {
    const inputProps = utils.extend({}, this.props);
    let ThisComponent = 'input';

    // 删除多余属性
    delete inputProps.seeAble;
    delete inputProps.Component;
    delete inputProps.loading;
    delete inputProps.validator;
    delete inputProps.check;
    delete inputProps.checkClear;
    delete inputProps.errMsg;
    delete inputProps.validateAt;
    delete inputProps.onValidError;
    delete inputProps.options;
    delete inputProps.isFocus;
    delete inputProps.help;
    delete inputProps.text;
    delete inputProps.saveOnChange;
    delete inputProps.showPrecondition;
    delete inputProps.display;
    delete inputProps.hasTextInput;
    delete inputProps.theme;
    delete inputProps.inputStyle;
    delete inputProps.onValue;
    delete inputProps.offValue;
    delete inputProps.unit;
    delete inputProps.notEditable;
    delete inputProps.dataType;
    delete inputProps.defaultValue;
    delete inputProps.isLoading;

    if (inputProps.type === 'textarea') {
      ThisComponent = 'textarea';
    }
    // if () {

    // }

    return (
      <ThisComponent
        {...inputProps}
        ref={ref => (this.myRef = ref)}
      />
    );
  }
}

Input.propTypes = propTypes;
Input.defaultProps = defaultProps;

export default Input;
