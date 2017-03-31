import React, { PropTypes } from 'react';
import { fromJS } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import utils from 'shared/utils';
// import EchartReact from 'shared/components/EchartReact';
import AppScreen from 'shared/components/Template/AppScreen';
import { actions as appActions } from 'shared/containers/app';
import { actions } from 'shared/containers/appScreen';

const propTypes = fromJS({
  route: PropTypes.object,
  initScreen: PropTypes.func,
});

export default class EthStatistic extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeSettingData = this.onChangeSettingData.bind(this);
  }

  onChangeSettingData(data, val) {
    const payload = {
      action: 'active',
      active_eth: data.value,
      ethx_name: val.slice(0, 4),
    };
    this.props.save(this.props.route.formUrl, payload).then((json) => {
      if (json.state && json.state.code === 2000) {
        this.props.fetchScreenData();
      }
    });
  }

  render() {
    const settingsFormOptions = fromJS([
      {
        id: 'ndpiEnable',
        label: __('NDPI Enable'),
        type: 'checkbox',
        saveOnChange: true,
        // onChange: (data) => {
        //   const payload = {
        //     action: 'setting',
        //     ndpiEnable: data.value,
        //   };
        //   this.props.save(this.props.route.formUrl, payload).then((json) => {
        //     if (json.state && json.state.code === 2000) {
        //       this.props.fetchScreenData();
        //     }
        //   });
        // },
      },
      {
        id: 'eth0Enable',
        label: __('Active Status'),
        text: __('eth0'),
        type: 'checkbox',
        onChange: (data) => { this.onChangeSettingData(data, 'eth0Enable'); },
      },
      {
        id: 'eth1Enable',
        label: __('Active Status'),
        text: __('eth1'),
        type: 'checkbox',
        onChange: (data) => { this.onChangeSettingData(data, 'eth1Enable'); },
      },
      {
        id: 'eth2Enable',
        label: __('Active Status'),
        text: __('eth2'),
        type: 'checkbox',
        onChange: (data) => { this.onChangeSettingData(data, 'eth2Enable'); },
      },
      {
        id: 'eth3Enable',
        label: __('Active Status'),
        text: __('eth3'),
        type: 'checkbox',
        onChange: (data) => { this.onChangeSettingData(data, 'eth3Enable'); },
      },
      {
        id: 'eth4Enable',
        label: __('Active Status'),
        text: __('eth4'),
        type: 'checkbox',
        onChange: (data) => { this.onChangeSettingData(data, 'eth4Enable'); },
      },
      {
        id: 'eth5Enable',
        label: __('Active Status'),
        text: __('eth5'),
        type: 'checkbox',
        onChange: (data) => { this.onChangeSettingData(data, 'eth5Enable'); },
      },
    ]);
    return (
      <AppScreen
        {...this.props}
        settingsFormOptions={settingsFormOptions}
      />
    );
  }
}

EthStatistic.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.screens,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    actions,
  ), dispatch);
}

export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EthStatistic);