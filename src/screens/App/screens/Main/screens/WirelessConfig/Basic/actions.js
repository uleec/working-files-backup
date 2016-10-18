import { updateItemSettings } from 'shared/actions/settings';
import { fetch } from 'shared/actions/app';


export function changeScanStatus(data) {
  return {
    type: 'CHANGE_SCAN_STATUS',
    data,
  };
}

export function changeShowScanResultStatus(data) {
  return {
    type: 'CHANGE_SHOW_SCAN_RESULT_STATUS',
    data,
  };
}

export function setScanResult(data) {
  return {
    type: 'SET_SCAN_RESULT',
    data,
  };
}

export function changeSelectedResult(data) {
  return {
    type: 'CHANGE_SELECTED_RESULT',
    data,
  };
}

export function leaveScreen() {
  return {
    type: 'LEAVE_SCREEN',
  };
}

export function changeCtyModal(data) {
  return {
    type: 'CHANGE_CTY_MODAL',
    data,
  };
}

export function changeAgreeProtocol(data) {
  return {
    type: 'CHANGE_AGREE_PROTOCOL',
    data,
  };
}

export function changeCountryCode(data) {
  return {
    type: 'CHANGE_COUNTRY_CODE',
    data,
  };
}

export function closeCountrySelectModal(data) {
  return {
    type: 'CLOSE_COUNTRY_SELECT_MODAL',
    data,
  };
}

export function receiveCountryInfo(data) {
  return {
    type: 'RECEIVE_COUNTRY_INFO',
    data,
  };
}

export function saveCountrySelectModal() {
  return (dispatch, getState) => {
    const selectedCode = getState().basic.get('selectedCountry');
    dispatch(updateRadioSettingsItem({
      countryCode: selectedCode,
    }));
    const channelWidth = getState().basic.getIn(['radioSettings', 'channelWidth']);
    const saveInfo = {
      radio: '5G',
      country: selectedCode,
      channelWidth,
    };
    dispatch(fetch('goform/get_country_info', saveInfo))
            .then((json) => {
              // console.log('json', json.data);
              if (json.state && json.state.code === 2000) {
                dispatch(receiveCountryInfo(json.data));
              }
            });
    dispatch(changeCtyModal(false));
  };
}






// 需求改变后的代码
// data: {name: 'showMultiSsid/showSsidSetting/showRadioSetting', value: true}
export function changeTitleShowIcon(data) {
  return {
    type: 'CHANGE_TITLE_SHOW_ICON',
    data,
  };
}

export function changeTableItemForSsid(data) {
  return {
    type: 'CHANGE_TABLE_ITEM_FOR_SSID',
    data,
  };
}

export function updateSelfItemSettings(data) {
  return {
    type: 'UPDATE_SELF_ITEM_SETTINGS',
    data,
  };
}

export function updateRadioSettingsItem(data) {
  return {
    type: 'UPDATE_RADIO_SETTINGS_ITEM',
    data,
  };
}

export function updateMultiSsidItem(data) {
  return {
    type: 'UPDATE_MULTI_SSID_ITEM',
    data,
  };
}

export function updateBasicSettings(data) {
  return {
    type: 'UPDATE_BASIC_SETTINGS',
    data,
  };
}

export function changeWhichButton(data) {
  return {
    type: 'CHANGE_WHICH_BUTTON',
    data,
  };
}
