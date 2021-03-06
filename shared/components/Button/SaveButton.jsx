import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

let timeOut = null;

const propTypes = {
  text: PropTypes.string,
  savingText: PropTypes.string,
  savedText: PropTypes.string,
  loading: PropTypes.bool,
};

const defaultProps = {
  text: __('Save'),
  savingText: __('Saving'),
  savedText: __('Saved'),
  theme: 'primary',
  icon: 'save',
};
class SaveButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: 'default',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loading && !nextProps.loading) {
      this.setState({
        status: 'ok',
      });

      timeOut = setTimeout(() => {
        this.setState({
          status: 'default',
        });
      }, 1000);
    } else if (nextProps.loading) {
      this.setState({
        status: 'saving',
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(timeOut);
  }

  render() {
    const { text, savingText, savedText } = this.props;
    let showText = text;
    if (this.state.status === 'saving') {
      showText = savingText;
    } else if (this.state.status === 'ok') {
      showText = savedText;
    }

    return (
      <Button
        {...this.props}
        text={showText}
      />
    );
  }
}

SaveButton.propTypes = propTypes;
SaveButton.defaultProps = defaultProps;

export default SaveButton;
