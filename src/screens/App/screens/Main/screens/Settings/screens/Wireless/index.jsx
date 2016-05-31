import React, {PropTypes} from 'react';
import utils from 'utils';
import { bindActionCreators } from 'redux';
import {fromJS, Map, List} from 'immutable';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import validator from 'utils/lib/validator';
import * as validateActions from 'actions/valid';
import * as myActions from './actions';
import { fetchDeviceGroups } from '../GroupSettings/actions';
import myReducer from './reducer';

import {FormGroup, Checkbox, FormInput} from 'components/Form';
import Select from 'components/Select';
import Button from 'components/Button';
import channels from './channels.json';
import Switchs from 'components/Switchs';

const msg = {
  'upSpeed': _('Up Speed'),
  'downSpeed': _('Down Speed'),
  'selectGroup': _('Select Group')
};
const encryptionOptions = [
  {
    value: 'none',
    label: _('NONE')
  },
  {
    value: 'psk-mixed',
    label: _('STRONG')
  }
];
const channelBandwidthOptions = fromJS([
  {
    value: '20',
    label: '20'
  }, {
    value: '40',
    label: '40'
  }
]);

const validOptions = Map({
  password: validator({
    rules: 'len:[8, 64]'
  }),
  vlanid: validator({
    rules: 'num:[2, 4094]'
  }),
  ssid: validator({
    rules: 'len:[1, 64]'
  }),
  upstream: validator({
    rules: 'num:[0, 102400]'
  }),
  downstream: validator({
    rules: 'num:[0, 102400]',
  })
});

const channelsList = List(channels);

const propTypes = {
  fetchDeviceGroups: PropTypes.func,
  fetching: PropTypes.bool,
  data: PropTypes.instanceOf(Map),
  groups: PropTypes.instanceOf(List)
};

export const Wireless = React.createClass({
  mixins: [PureRenderMixin],
  
  componentWillMount() {
    this.props.fetchWifiSettings();
  },
  
  componentWillUnmount() {
    this.props.resetVaildateMsg();
  },
  
  onUpdate(name) {
    return function(item) {
      let data = {};
      
      data[name] = item.value;
      console.log(item)
      this.props.changeWifiSettings(data);
    }.bind(this)
  },
  
  onChangeGroup(item) {
    this.props.changeWifiGroup(item.value);
  },
  
  onChangeEncryption(item) {
    const data = {
      encryption: item.value
    };
    
    this.props.changeWifiSettings(data);
  },
  
  onUpdateSettings(name) {
    return function(item) {
      const data = {};
      data[name] = item.value;
      
      this.props.changeWifiSettings(data);
    }.bind(this)
  },
  
  onSave() {
    this.props.validateAll(function(invalid) {
      if(invalid.isEmpty()) {
        this.props.setWifi();
      }
    }.bind(this));
  },
  
  getCurrData(name) {
    return this.props.store.getIn(['data', 'curr', name]);
  },
  
  getGroupOptions() {
    return this.props.store
      .getIn(['data', 'list'])
      .map(function(item, i) {
        return {
          value: item.get('groupname'),
          label: item.get('groupname')
        }
      })
      .toJS();
  },
  
  getCountryOptions() {
    return channelsList.map(function(item) {
      return {
        value: item.country,
        label: b28n.getLang() === 'cn' ? _(item.cn) : _(item.en)
      }
    }).toJS();
  },
  
  getChannelsOptions(currCountry) {
    let i, len, channelsRange;
    let channelsOptions = [
      {
        value: '0',
        label: _('auto')
      }
    ];
    let channelsOption = channelsList.find(function(item) {
      return item.country === currCountry;
    });
    
    if(channelsOption) {
      channelsRange = channelsOption['2.4g'].split('-');
      i = parseInt(channelsRange[0], 10);
      len = parseInt(channelsRange[1], 10);
    } else {
      i = 1;
      len = 13;
    }
    
    for(i; i <= len ; i++) {
      channelsOptions.push({
        value: i + '',
        label: i + ''
      });
    }
    
    return channelsOptions;
  },
  
  render() {
    const {
        password, vlanid, ssid, upstream, downstream
      } = this.props.validateOption;
    const groupOptions = this.getGroupOptions();
    const countryOptions = this.getCountryOptions();
    const getCurrData =  this.getCurrData;
    const channelsOptions = this.getChannelsOptions(getCurrData('country'));
    
    return (
      <div>
        <h3>{ _('Current Group') }</h3>
        <FormGroup
          type="select"
          label={msg.selectGroup}
          options={groupOptions}
          value={getCurrData('groupname')}
          onChange={this.onChangeGroup}
        />
        
        <h3>{_('Base Options')}</h3>
        <FormGroup
          label={ _('SSID') }
          required={true}
          value={getCurrData('ssid')}
          onChange={this.onUpdateSettings('ssid')}
          {...ssid}
        />
        <FormGroup
          type="select"
          label={_('Encryption')}
          options={encryptionOptions}
          value={getCurrData('encryption')}
          onChange={this.onUpdateSettings('encryption')}
        />
        {
          getCurrData('encryption') === 'psk-mixed' ?
            <FormGroup
              label={ _('Password') }
              type="password"
              required={true}
              value={getCurrData('password')}
              onChange={this.onUpdateSettings('password')}
              {...password}
            /> : ''
        }
        <FormGroup
          label={_('VLAN')}
          value={getCurrData('vlanid')}
          required={getCurrData('vlanenable') == '1'}
         
          {...vlanid}
        > 
          <FormInput
            type="checkbox"
            checked={getCurrData('vlanenable') == '1'}
            onChange={this.onUpdate('vlanenable')}
          />
            
          {
            getCurrData('vlanenable') == '1' ? 
              (
                <span style={{'marginLeft': '5px'}}>
                  { _('Use VLAN ID:') }
                  <FormInput
                    type="text"
                    style={{'marginLeft': '3px'}}
                    className="input-sm"
                    value={getCurrData('vlanid')}
                    onChange={this.onUpdate('vlanid')}
                  />
                </span>
              ) : ''
          }
        </FormGroup>
        
        <h3>{_('Wireless Channel')}</h3>
        <FormGroup
          type="select"
          label={ _('Country')}
          options={countryOptions}
          value={getCurrData('country')}
          onChange={this.onUpdateSettings('country')}
        />
        <FormGroup
          type="select"
          label={ _('Channel')}
          options={channelsOptions}
          value={getCurrData('channel')}
          onChange={this.onUpdateSettings('channel')}
        />
        <FormGroup label={_('Channel Bandwidth')} >
          <Switchs
            options={channelBandwidthOptions}
            value={getCurrData('channelsBandwidth')}
            onChange={this.onUpdateSettings('channelsBandwidth')}
          />
        </FormGroup>
        
        <h3>{_('Bandwidth')}</h3>
        <FormGroup
          label={msg.upSpeed}
          required={true}
          help="KB"
          value={getCurrData('upstream')}
          {...upstream}
        >
          <FormInput
            type="checkbox"
            value="64"
            checked={ getCurrData('upstream') === '' || getCurrData('upstream') > 0 }
            onChange={this.onUpdate('upstream')}
          />
          {_('limited to') + ' '}
          <FormInput
            type="number"
            maxLength="6"
            size="sm"
            disabled={ getCurrData('upstream') === '0' }
            value={getCurrData('upstream')}
            onChange={this.onUpdate('upstream')}
          />
        </FormGroup>
        
        <FormGroup
          type="number"
          label={msg.downSpeed}
          help="KB"
          maxLength="6"
          required={true}
          value={getCurrData('downstream')}
          onChange={this.onUpdate('downstream')}
          {...downstream}
        >
          <FormInput
            type="checkbox"
            value="256"
            checked={ getCurrData('downstream') === '' || getCurrData('downstream') > 0 }
            onChange={this.onUpdate('downstream')}
          />
          {_('limited to') + ' '}
          <FormInput
            type="number"
            maxLength="6"
            size="sm"
            disabled={ getCurrData('downstream') === '0' }
            value={getCurrData('downstream')}
            onChange={this.onUpdate('downstream')}
          />
        </FormGroup>
        
        <div className="form-group">
          <div className="form-control">
             <Button
              type='button'
              text={_('Save')}
              role="save"
              onClick={this.onSave}
            />
          </div>
        </div>
      </div>
    );
  }
});

Wireless.propTypes = propTypes;

//React.PropTypes.instanceOf(Immutable.List).isRequired
function mapStateToProps(state) {
  var myState = state.wireless;

  return {
    store: myState,
    app: state.app
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    {fetchDeviceGroups},
    validateActions,
    myActions
  ), dispatch)
}

// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
  validator.mergeProps(validOptions)
)(Wireless);

export const reducer = myReducer;
