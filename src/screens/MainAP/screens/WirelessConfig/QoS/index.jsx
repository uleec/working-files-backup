import React from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import Select from 'react-select';
import { FormGroup, FormInput } from 'shared/components';
import Table from 'shared/components/Table';
import * as actions from './actions';
import reducer from './reducer';

const radioOptions = [
  { value: '1', label: __('Radio 1(2.4G)') },
  { value: '2', label: __('Radio 1(5G)') },
];

const qosTempOptions = [
  { value: '1', label: __('Default') },
  { value: '2', label: __('Custom') },
];

const wapEdcaOptions = fromJS([
  {
    id: 'Application',
    text: __('Application'),
  },
  {
    id: 'AIFS',
    text: 'AIFS',
    render: (val) => (
      <div
        style={{ marginLeft: '-200px',
                marginTop: '8px',
                marginBotton: '5px',
              }}
      >
        <FormGroup>
          <FormInput
            value={val}
          />
        </FormGroup>
      </div>
      ),
  },
  {
    id: 'cwMin',
    text: 'cwMin',
    render: (val) => (
      <div
        style={{ marginLeft: '-200px',
                marginTop: '8px',
                marginBotton: '5px',
              }}
      >
        <FormGroup>
          <FormInput
            value={val}
          />
        </FormGroup>
      </div>
      ),
  },
  {
    id: 'cwMax',
    text: 'cwMax',
    render: (val) => (
      <div
        style={{ marginLeft: '-200px',
                marginTop: '8px',
                marginBotton: '5px',
              }}
      >
        <FormGroup>
          <FormInput
            value={val}
          />
        </FormGroup>
      </div>
      ),
  },
  {
    id: 'Max.Burst',
    text: 'Max.Burst',
    render: (val) => (
      <div
        style={{ marginLeft: '-200px',
                marginTop: '8px',
                marginBotton: '5px',
              }}
      >
        <FormGroup>
          <FormInput
            value={val}
          />
        </FormGroup>
      </div>
      ),
  },
]);


export default class QoS extends React.Component {


  render() {
    return (
      <div>
        <div className="radioSelect">
          <h3>{__('Select Your Radio')}</h3>
          <FormGroup
            label="Radio"
          >
            <Select
              options={radioOptions}
            />
          </FormGroup>
          <FormGroup
            label="EDCA Template"
          >
            <Select
              options={qosTempOptions}
            />
          </FormGroup>
        </div>
        <div className="qosSettings">
          <h3>{__('QoS Setting')}</h3>
          <FormGroup
            label={__('WAP EDCA Parameters')}
          >
            <Table
              options={wapEdcaOptions}
              list={wapEdcaList}
            />
          </FormGroup>
        </div>
        <FormGroup
          label="Wi-Fi Multimedia(WMM)"
          type="checkbox"
        />
        <div className="stationEdcaPara">
          <FormGroup
            label={__('Station EDCA Parameters')}
          >
            <Table
              options={wapEdcaOptions}
              list={wapEdcaList}
            />
          </FormGroup>
        </div>
        <FormGroup
          label="No Acknowledgement"
          type="checkbox"
        />
        <FormGroup
          label="APSD"
          type="checkbox"
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const myState = state.qos;

  return {
    fecthing: myState.get('fetching'),
  };
}

export const Screen = connect(
  mapStateToProps,
  actions
)(QoS);

export const qos = reducer;
