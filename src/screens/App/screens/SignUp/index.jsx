import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {Input, FormGroup} from 'components/Form';
import {fromJS, Map, List} from 'immutable';
import validator from 'utils/lib/validator';
import utils from 'utils';

const msg = {
  password:  _('Password'),
  confirmpasswd: _('Confirm Password')
}

const formGroups = List([
  {
    input: {
      type: 'password',
      label: msg.password,
      name: 'password',
      maxLength: 21,
      placeholder: msg.password,
    },
    validator: validator({
      label: msg.password,
      rules: 'required'
    })
  }, {
    input: {
      label: msg.confirmpasswd,
      type: 'password',
      name: 'confirmpasswd',
      maxLength: 21,
      placeholder: msg.confirmpasswd,
    },
    validator: validator({
      label: msg.confirmpasswd,
      rules: 'required'
    })
  }
]);

function createList(item) {
  var input = item.input;
  
  return (
    <FormGroup
      {...input}
      key={input.name}
      id={input.name}
      value={this.getDataValue(input.name) }
      onChange={this.onChangeData(input.name) }
      onKeyUp={this.onInputKeyUp}
    />
  );
}

// 原生的 react 页面
export const SignUp = React.createClass({
  mixins: [PureRenderMixin],
  
  getInitialState() {
    return {
      password: '',
      confirmpasswd: ''
    }
  },
  
  componentWillMount() {
    
  },

  componentWillReceiveProps(nextProps) {
   
  },
  
  checkData() {
    const data = this.state;
    let checkResult;
    
    formGroups.forEach(function(item) {
      var key = item.input.name;
      
      checkResult = item.validator.check(data[key]);
      
      if(checkResult) {
        return false;
      }
    });
    
    if(!checkResult) {
      if(this.state.password !== this.state.confirmpasswd) {
        checkResult = _('Password and confirm password must match')
      }
    }
    
    return checkResult;
  },
  
  signUp() {
    utils.save('/goform/regist', {
      password: this.state.password,
      confirmpasswd: this.state.confirmpasswd
    })
    .then(function(json) {
      if(json.state && json.state.code === 2000) {
        window.location.hash = '';
      }
    }.bind(this))
  },

  onSignUp() {
    var checkResult = this.checkData();
    
    // 如果有验证错误信息
    if(checkResult) {
      this.updateState({
        status: checkResult
      })
      
    //
    } else {
      this.signUp();
    }
    
  },
  
  updateState(data) {
    this.setState(utils.extend({}, this.state, data));
  },

  onChangeData(name) {
    return function(options) {
      let data = {};
      
      data[name] = options.value;
      this.updateState(data);
    }.bind(this)
  },

  getDataValue(name) {
    return this.state[name] || '';
  },
  
  onInputKeyUp(e) {
    
    if(e.which === 13) {
      if(e.target.id === 'password') {
        document.getElementById('confirmpasswd').focus();
      } else {
        this.onSignUp();
      }
    }
  },

  render() {
    var FormGroupList;
    var that = this;
    var myMsg = this.props.status;

    FormGroupList = formGroups.map(createList.bind(this));
    
    return (
      <div>
        <header className="navbar">
          <a href="" className="brand">Comlanos {_('Management')}</a>
        </header>
        <div className="sign">
          <h1>{_('Please Sign Up')}</h1>
          {FormGroupList}
          {
            this.state.status !== 'ok' ?
              <p className="msg-error ">{this.state.status}</p> :
              ''
          }
          <button className="btn"
            onClick={this.onSignUp}>
            {_('Sign Up')}
          </button>
        </div>
      </div>
    );
  }
});

// 添加 redux 属性的 react 页面
export const Screen = SignUp;