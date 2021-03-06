import React from 'react';
import utils from 'shared/utils';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { bindActionCreators } from 'redux';

import FormGroup from 'shared/components/Form/FormGroup';
import Button from 'shared/components/Button/Button';
import { actions as screenActions, AppScreen } from 'shared/containers/appScreen';
import { actions as appActions } from 'shared/containers/app';

const settingsFormOptions = fromJS([
  {
    id: 'retainDays',
    label: __('Retain Days'),
    fieldset: 'retainDays',
    legend: __('Log Duration'),
    defaultValue: '7',
    type: 'number',
    min: '1',
    max: '365',
    help: __('Days'),
    saveOnChange: true,
  },
]);
const propTypes = {};
const defaultProps = {};

export default class View extends React.Component {
  constructor(props) {
    super(props);
    utils.binds(this, [
      'onDownloadSystemLog',
    ]);
  }

  onDownloadSystemLog() {
    window.location.href = '/goform/system/logdownload';
    // this.props.fetch('/goform/system/logdownload');
    // window.open('/goform/system/logdownload', 'dowmloadLog');
  }

  render() {
    return (
      <AppScreen
        {...this.props}
        // settingsFormOptions={settingsFormOptions}
        noTitle
      >
        <div className="o-form">
          <fieldset className="o-form__fieldset">
            <legend className="o-form__legend">{__('System Log')}</legend>
            <FormGroup label={__('Download System Log')}>
              <Button
                Component="a"
                theme="primary"
                icon="download"
                text={__('Download')}
                href="/goform/system/logdownload"
              />
            </FormGroup>
          </fieldset>
        </div>
      </AppScreen>
    );
  }
}

View.propTypes = propTypes;
View.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    app: state.app,
    store: state.screens,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(utils.extend({},
    appActions,
    screenActions,
  ), dispatch);
}


// 添加 redux 属性的 react 页面
export const Screen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(View);
