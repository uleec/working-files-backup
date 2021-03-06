import React from 'react';
import PropTypes from 'prop-types';
import ReactCSSTransition from 'react-transition-group/CSSTransition';
import utils from 'shared/utils';
import PureComponent from '../Base/PureComponent';

const propTypes = {
  isShow: PropTypes.bool,
  overlay: PropTypes.bool,
  exit: PropTypes.bool,
  enter: PropTypes.bool,
  transitionName: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
};

const defaultProps = {
  enter: true,
  exit: true,
  transitionName: 'zoom-top-right',
  overlay: true,
};

class PopOver extends PureComponent {
  constructor(props) {
    super(props);

    utils.binds(this, [
      'onClose',
    ]);
  }

  onClose() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const { exit, enter, isShow, overlay, transitionName } = this.props;
    const keyVal = 'onlyPopOver';

    return (
      <ReactCSSTransition
        classNames={transitionName}
        enter={enter}
        exit={exit}
        timeout={{
          enter: 500,
          exit: 300,
        }}
        in={isShow}
        mountOnEnter
        unmountOnExit
      >
        {
          overlay ? (
            <div key={keyVal} className="o-pop-over">
              <div
                className="o-pop-over__overlay"
                onClick={this.onClose}
              />

              {this.props.children}
            </div>
          ) : (
            <div key={keyVal}>
              {this.props.children}
            </div>
          )
        }
      </ReactCSSTransition>
    );
  }
}

PopOver.propTypes = propTypes;
PopOver.defaultProps = defaultProps;

export default PopOver;
