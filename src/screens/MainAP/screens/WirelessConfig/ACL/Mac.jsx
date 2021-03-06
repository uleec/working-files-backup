import React from 'react'; import PropTypes from 'prop-types';

export default class Mac extends React.Component {
  render() {
    return (
      <li
        onClick={this.props.onClick}
        style={{
          textDecoration: this.props.selected ? 'line-through' : 'none',
          cursor: this.props.selected ? 'default' : 'pointer',
          fontSize: '13px',
          paddingLeft: '5px',
        }}
        disabled={this.props.disabled}
      >
        {this.props.text}
      </li>
    );
  }
}

Mac.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
};
