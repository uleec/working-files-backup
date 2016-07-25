import React, { PropTypes } from 'react';
import Button from './index';

let timeOut = null;

const propTypes = {
  text: PropTypes.string,
  loading: PropTypes.bool,
};

const defaultProps = {
  text: _('Save'),
  role: 'primary',
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
    let { text } = this.props;

    if (this.state.status === 'saving') {
      text = _('Saving');
    } else if (this.state.status === 'ok') {
      text = _('Saved');
    }

    return (
      <Button
        {...this.props}
        text={text}
      />
    );
  }
}

SaveButton.propTypes = propTypes;
SaveButton.defaultProps = defaultProps;

export default SaveButton;
