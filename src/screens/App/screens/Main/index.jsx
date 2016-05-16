import React, { Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import Nav from 'components/Nav';
import Icon from 'components/Icon';
import Sidebar from './components/Sidebar';
import * as actions from './actions';

const BRAND_TEXT = 'Comlanos ' + _('Management');

export default class Main extends Component {
  constructor(props) {
    super(props)
    
    this.state = {isShow: false};
    
    this.showUserPopOver = this.showUserPopOver.bind(this);
  };
  
  showUserPopOver() {
    this.setState({isShow: !this.state.isShow});
  };
  
  render() {
    return (
      <div>
        <header className="navbar">
          <a href="" className="brand">{BRAND_TEXT}</a>
          <div className="fr user" onClick={this.showUserPopOver}>
            <Icon name="user-secret" className="icon-user" />
            <Icon
              name="caret-down"
              className="icon-down"
            />
          </div>
        </header>
        <div
          className="main"
        >
          <div className='main-content'>
            <div className='main-content-wrap'>
              {React.cloneElement(this.props.children, {
                key: this.props.location.pathname
              })}
            </div>  
          </div>
          <Nav className="main-nav" menus={this.props.route.childRoutes} />
         
        </div>
        {
            this.state.isShow ? (
              <div className="pop-over" onClick={this.showUserPopOver}>
                <div
                  className="user-pop-over"
                >
                  <div className="user-info">
                    <Icon name="user-secret" className="icon-user" />
                  </div>
                  <div className="user-controls">
                    <a className="change-pas" href="#/main/settings/admin">
                      <Icon
                        name="key"
                      />
                      {_('CHANGE PASSWORD')}
                    </a>
                    <a className="sign-out" href="#">
                      <Icon
                        name="sign-out"
                      />
                      {_('SIGN OUT')}
                    </a>
                  </div>
                </div>
                <div className="overlay"></div>
              </div>
            ) : null
          }
      </div>
    )
  }
}

// function mapStateToProps(state) {
//   var myState = state.main;

//   return {
//     fetching: myState.get('fetching'),
//     logined: myState.get('logined'),
//     data: myState.get('data')
//   };
// }

// export const Screen = connect(
//   mapStateToProps,
//   actions
// )(Main);
