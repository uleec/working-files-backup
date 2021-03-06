import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import utils from 'shared/utils';

const uptimeFilter = utils.filter('connectTime');
const flowRateFilter = utils.filter('flowRate');

const propTypes = {
  store: PropTypes.instanceOf(Map),
};

const defaultProps = {
};

function DeviceOverview(props) {
  const info = props.store.getIn(['data']);
  return (
    <div className="o-description-list">
      <dl className="o-description-list-row">
        <dt>{__('MAC Address')}</dt>
        <dd>{info.get('mac')}</dd>
      </dl>
      <dl className="o-description-list-row">
        <dt>{__('Model')}</dt>
        <dd>{info.get('model')}</dd>
      </dl>
      <dl className="o-description-list-row">
        <dt>{__('Firmware Version')}</dt>
        <dd>{info.get('softversion')}</dd>
      </dl>
      <dl className="o-description-list-row">
        <dt>{__('Clients Number')}</dt>
        <dd>{info.get('connectedNumbers')}</dd>
      </dl>
      <dl className="o-description-list-row">
        <dt>{__('Uptime')}</dt>
        <dd>{uptimeFilter.transform(info.get('operationhours'))}</dd>
      </dl>
      <dl className="o-description-list-row">
        <dt>{__('IP Address')}</dt>
        <dd>{info.get('ip')}</dd>
      </dl>
      <dl className="o-description-list-row">
        <dt>{__('Data')}</dt>
        <dd>{flowRateFilter.transform(info.get('upstream'))}↑/{flowRateFilter.transform(info.get('downstream'))}↓</dd>
      </dl>
    </div>
  );
}
DeviceOverview.propTypes = propTypes;
DeviceOverview.defaultProps = defaultProps;

export default DeviceOverview;
