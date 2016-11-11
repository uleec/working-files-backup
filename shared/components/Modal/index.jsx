import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';
import utils from '../../utils';

let curModelShowNum = 0;
let backdropTimeout = null;

function renderBackdrop(isShow, transitionEnter, transitionLeave) {
  const modalBackdropElem = document.getElementById('modalBackdrop');
  let modalBackdropHtml = '<div id="modalBackdrop" class="o-modal__backdrop fade"></div>';

  if (isShow) {
    curModelShowNum += 1;
    if (!modalBackdropElem) {
      document.body.appendChild(utils.dom.fragment(modalBackdropHtml));
    }
  } else if (curModelShowNum > 0) {
    curModelShowNum -= 1;
    modalBackdropHtml = '<div id="modalBackdrop" class="o-modal__backdrop in"></div>';
  }
  // 如果是显示
  if (curModelShowNum > 0) {
    if (transitionEnter) {
      clearTimeout(backdropTimeout);
      backdropTimeout = setTimeout(
        () => {
          document.getElementById('modalBackdrop').className = classNames(
            'o-modal__backdrop',
            {
              in: isShow,
              fade: !isShow,
            },
          );
        }, 10);
    } else {
      document.getElementById('modalBackdrop').className = classNames(
        'o-modal__backdrop',
        {
          in: isShow,
          fade: !isShow,
        },
      );
    }

  // 隐藏Backdrop, 并显示动画
  } else if (transitionLeave) {
    setTimeout(
      () => {
        if (document.getElementById('modalBackdrop')) {
          document.getElementById('modalBackdrop').className = classNames(
            'o-modal__backdrop',
            {
              in: isShow,
              fade: !isShow,
            },
          );
        }
      }, 10);

    // 定时删除Backdrop元素
    clearTimeout(backdropTimeout);
    backdropTimeout = setTimeout(
      () => {
        const newElem = document.getElementById('modalBackdrop');
        if (newElem) {
          document.body.removeChild(newElem);
        }
      }, 500);

  // 隐藏并无动画
  } else {
    document.body.removeChild(modalBackdropElem);
  }
}

const propTypes = {
  isShow: PropTypes.bool,
  title: PropTypes.any,
  id: PropTypes.string,
  style: PropTypes.object,
  size: PropTypes.oneOf(['min', 'md', 'lg', 'xlg', 'max']),
  role: PropTypes.oneOf(['dialog', 'alert', 'confirm', 'message', 'loading']),
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  transitionLeave: PropTypes.bool,
  transitionEnter: PropTypes.bool,
  okButton: PropTypes.bool,
  draggable: PropTypes.bool,
  cancelButton: PropTypes.bool,
  noFooter: PropTypes.bool,
  customBackdrop: PropTypes.bool,
  onClose: PropTypes.func,
  onOk: PropTypes.func,
  children: PropTypes.any,
};

const defaultProps = {
  title: '',
  role: 'dialog',
  okText: _('OK'),
  cancelText: _('Cancel'),
  transitionEnter: true,
  transitionLeave: true,
  okButton: true,
  cancelButton: true,
  noFooter: false,
  customBackdrop: false,
};

class Modal extends Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onOk = this.onOk.bind(this);
  }
  componentDidMount() {
    if (this.props.isShow && !this.props.customBackdrop) {
      renderBackdrop(
        this.props.isShow,
        this.props.transitionEnter,
        this.props.transitionLeave,
      );
    }
    this.modalKey = `model${utils.uuid()}`;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isShow !== this.props.isShow && !this.props.customBackdrop) {
      renderBackdrop(
        this.props.isShow,
        this.props.transitionEnter,
        this.props.transitionLeave,
      );
    }
  }
  componentWillUnmount() {
    const isShowModel = false;
    renderBackdrop(
      isShowModel,
      this.props.transitionEnter,
      this.props.transitionLeave,
    );
  }
  onClose() {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
    }
  }

  onOk() {
    if (typeof this.props.onOk === 'function') {
      this.props.onOk();
    }
  }
  renderDom() {
    const { isShow } = this.props;

    document.body.className = classNames(
      document.body.className.replace(/(^\s*)|(\s*)o-modal--open/g, ''),
      {
        'o-modal--open': isShow,
      },
    );
  }
  render() {
    const { size, role, id, transitionLeave, transitionEnter,
      isShow, title, cancelText, okButton, okText, draggable,
      customBackdrop,
    } = this.props;
    let noFooter = this.props.noFooter;
    let contentClassNames;
    let keyVal = this.modalKey;
    let hasCloseBtn = true;
    let { cancelButton } = this.props;
    let modalClassName = 'o-modal';

    // role is shown in contentClassNames
    if (role) {
      contentClassNames = `o-modal__${role}`;
    }

    if (draggable) {
      modalClassName = `${modalClassName} o-modal--draggable`;
    }

    // ReactCSSTransitionGroup need key value
    if (size) {
      modalClassName = `${modalClassName} o-modal--${size}`;
    }

    // ReactCSSTransitionGroup need key value
    if (id) {
      keyVal = `${id}Modal`;
    }

    // No top close button
    if (role === 'message') {
      noFooter = true;
    } else if (role === 'confirm') {
      hasCloseBtn = false;

    // when role is "alert" no cancelButton
    } else if (role === 'alert') {
      cancelButton = false;
    }

    return (
      <ReactCSSTransitionGroup
        component="div"
        transitionName="fade-down"
        transitionEnter={transitionEnter}
        transitionLeave={transitionLeave}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {
          isShow ? (
            <div
              key={keyVal}
              className={modalClassName}
              role={role}
            >
              {
                customBackdrop ? (
                  <div className="o-modal__backdrop in" />
                ) : null
              }
              <div className={contentClassNames} draggable={draggable} style={this.props.style}>
                <div className="o-modal__content">
                  {
                    title ? (
                      <div className="o-modal__header">
                        {
                          hasCloseBtn ? (
                            <button
                              type="button"
                              className="close fr"
                              onClick={this.onClose}
                            >
                              &times;
                            </button>
                          ) : null
                        }
                        <h4 className="o-modal__title" id="myModalLabel">
                          {title}
                        </h4>
                      </div>
                    ) : null
                  }

                  <div className="o-modal__body">
                    {this.props.children}
                  </div>
                  {
                    !noFooter ? (
                      <div className="o-modal__footer">
                        {
                          cancelButton ? (
                            <button
                              type="button"
                              className="a-btn a-btn-default"
                              onClick={this.onClose}
                            >
                              {cancelText}
                            </button>
                          ) : null
                        }

                        {
                          okButton ? (
                            <button
                              type="button"
                              className="a-btn a-btn--primary"
                              onClick={this.onOk}
                            >
                              {okText}
                            </button>
                          ) : null
                        }

                      </div>
                    ) : null
                  }
                </div>
              </div>
            </div>
          ) : null
        }
      </ReactCSSTransitionGroup>
    );
  }
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;

export default Modal;
